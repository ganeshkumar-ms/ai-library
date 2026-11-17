import json
import mimetypes
import subprocess
import time
import urllib.request
from pathlib import Path

import boto3

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"
REGION = "us-east-1"

sts = boto3.client("sts", region_name=REGION)
ACCOUNT_ID = sts.get_caller_identity()["Account"]
BUCKET_NAME = f"ai-library-ui-{ACCOUNT_ID}"
OAC_NAME = f"ai-library-oac-{ACCOUNT_ID}"
COMMENT = "AI Agent Library Portal"

s3 = boto3.client("s3", region_name=REGION)
cf = boto3.client("cloudfront", region_name=REGION)


def build_react_app() -> None:
    print("0. Building AI Library React App with npm.cmd run build...")
    res = subprocess.run(["npm.cmd", "run", "build"], cwd=str(BASE_DIR), capture_output=True, text=True)
    if res.returncode != 0:
        print("Build output:", res.stdout)
        print("Build error:", res.stderr)
        raise RuntimeError("Vite build failed for ai-library")
    print("   Vite React build succeeded.")


def ensure_bucket_and_upload() -> None:
    print(f"1. Ensuring S3 bucket {BUCKET_NAME} exists and uploading dist/...")
    try:
        s3.head_bucket(Bucket=BUCKET_NAME)
    except Exception:
        s3.create_bucket(Bucket=BUCKET_NAME)

    s3.put_public_access_block(
        Bucket=BUCKET_NAME,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )

    if not DIST_DIR.exists():
        raise RuntimeError(f"Dist directory {DIST_DIR} does not exist!")

    for file_path in sorted(DIST_DIR.rglob("*")):
        if not file_path.is_file():
            continue
        rel = file_path.relative_to(DIST_DIR).as_posix()
        extra = {}
        if file_path.suffix == ".html":
            ctype = "text/html; charset=utf-8"
            extra["CacheControl"] = "no-cache, no-store, must-revalidate"
        elif file_path.suffix == ".zip":
            ctype = "application/zip"
            extra["ContentDisposition"] = f'attachment; filename="{file_path.name}"'
        elif file_path.suffix == ".gz":
            ctype = "application/gzip"
            extra["ContentDisposition"] = f'attachment; filename="{file_path.name}"'
        elif file_path.suffix == ".whl":
            ctype = "application/octet-stream"
            extra["ContentDisposition"] = f'attachment; filename="{file_path.name}"'
        elif file_path.suffix == ".css":
            ctype = "text/css; charset=utf-8"
        elif file_path.suffix == ".js":
            ctype = "application/javascript; charset=utf-8"
        else:
            ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=rel,
            Body=file_path.read_bytes(),
            ContentType=ctype,
            **extra,
        )
        print(f"   Uploaded s3://{BUCKET_NAME}/{rel} ({ctype})")


def ensure_cloudfront() -> str:
    print("2. Ensuring CloudFront OAC and Distribution...")
    oacs = cf.list_origin_access_controls().get("OriginAccessControlList", {}).get("Items", [])
    oac = next((x for x in oacs if x["Name"] == OAC_NAME), None)
    if oac:
        oac_id = oac["Id"]
    else:
        oac_id = cf.create_origin_access_control(
            OriginAccessControlConfig={
                "Name": OAC_NAME,
                "Description": "OAC for AI Agent Library S3 Static Site",
                "SigningProtocol": "sigv4",
                "SigningBehavior": "always",
                "OriginAccessControlOriginType": "s3",
            }
        )["OriginAccessControl"]["Id"]

    s3_origin_id = "AiLibraryS3Origin"
    s3_domain = f"{BUCKET_NAME}.s3.{REGION}.amazonaws.com"
    dists = cf.list_distributions().get("DistributionList", {}).get("Items", [])
    existing = next((d for d in dists if d.get("Comment") == COMMENT), None)

    if existing:
        dist_id = existing["Id"]
        dist_domain = existing["DomainName"]
        dist_arn = existing["ARN"]
        print(f"   Found existing distribution: {dist_id} ({dist_domain})")
        inv = cf.create_invalidation(
            DistributionId=dist_id,
            InvalidationBatch={"Paths": {"Quantity": 1, "Items": ["/*"]}, "CallerReference": str(time.time())},
        )
        print(f"   Created CloudFront cache invalidation: {inv['Invalidation']['Id']}")
    else:
        dist_config = {
            "CallerReference": f"ai-library-{ACCOUNT_ID}",
            "Aliases": {"Quantity": 0},
            "DefaultRootObject": "index.html",
            "Origins": {
                "Quantity": 1,
                "Items": [
                    {
                        "Id": s3_origin_id,
                        "DomainName": s3_domain,
                        "OriginPath": "",
                        "CustomHeaders": {"Quantity": 0},
                        "S3OriginConfig": {"OriginAccessIdentity": ""},
                        "OriginAccessControlId": oac_id,
                        "ConnectionAttempts": 3,
                        "ConnectionTimeout": 10,
                        "OriginShield": {"Enabled": False},
                    }
                ],
            },
            "OriginGroups": {"Quantity": 0},
            "DefaultCacheBehavior": {
                "TargetOriginId": s3_origin_id,
                "TrustedSigners": {"Enabled": False, "Quantity": 0},
                "TrustedKeyGroups": {"Enabled": False, "Quantity": 0},
                "ViewerProtocolPolicy": "redirect-to-https",
                "AllowedMethods": {
                    "Quantity": 2,
                    "Items": ["HEAD", "GET"],
                    "CachedMethods": {"Quantity": 2, "Items": ["HEAD", "GET"]},
                },
                "SmoothStreaming": False,
                "Compress": True,
                "LambdaFunctionAssociations": {"Quantity": 0},
                "FunctionAssociations": {"Quantity": 0},
                "FieldLevelEncryptionId": "",
                "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
            },
            "CacheBehaviors": {"Quantity": 0},
            "CustomErrorResponses": {"Quantity": 0},
            "Comment": COMMENT,
            "Logging": {"Enabled": False, "IncludeCookies": False, "Bucket": "", "Prefix": ""},
            "PriceClass": "PriceClass_All",
            "Enabled": True,
            "ViewerCertificate": {
                "CloudFrontDefaultCertificate": True,
                "MinimumProtocolVersion": "TLSv1",
                "CertificateSource": "cloudfront",
            },
            "Restrictions": {"GeoRestriction": {"RestrictionType": "none", "Quantity": 0}},
            "WebACLId": "",
            "HttpVersion": "http2",
            "IsIPV6Enabled": True,
            "ContinuousDeploymentPolicyId": "",
            "Staging": False,
        }
        created = cf.create_distribution(DistributionConfig=dist_config)["Distribution"]
        dist_id = created["Id"]
        dist_domain = created["DomainName"]
        dist_arn = created["ARN"]

    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipalReadOnly",
                "Effect": "Allow",
                "Principal": {"Service": "cloudfront.amazonaws.com"},
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*",
                "Condition": {"StringEquals": {"AWS:SourceArn": dist_arn}},
            }
        ],
    }
    s3.put_bucket_policy(Bucket=BUCKET_NAME, Policy=json.dumps(bucket_policy))

    live_url = f"https://{dist_domain}"
    return live_url


def verify_live(live_url: str) -> None:
    print(f"3. Verifying live deployment on {live_url}...")
    paths = [
        "/",
        "/downloads/taxora_agent-1.0.0-py3-none-any.whl",
        "/downloads/taxora-agent-1.0.0-sdk-bundle.zip",
        "/downloads/taxora-agent-1.0.0.tar.gz",
        "/downloads/claria-agent-1.0.0-sdk-bundle.zip",
        "/downloads/index-agent-1.0.0-sdk-bundle.zip",
        "/downloads/lens-agent-1.0.0-sdk-bundle.zip",
    ]
    for p in paths:
        url = live_url + p
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=20) as r:
                body = r.read()
                print(f"   [LIVE OK] HTTP {r.status} | {len(body):6d} bytes | {url}")
        except Exception as e:
            print(f"   [VERIFY FAILED] {url} -> {e}")


def main() -> None:
    build_react_app()
    ensure_bucket_and_upload()
    live_url = ensure_cloudfront()
    verify_live(live_url)
    print(f"\n==========================================")
    print(f"AI AGENT LIBRARY REACT PORTAL IS LIVE:")
    print(f"{live_url}")
    print(f"==========================================")


if __name__ == "__main__":
    main()
