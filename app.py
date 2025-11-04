import os
import io
import sys
import zipfile
import requests

OWNER = "smsram"
REPO = "smsram-figma-ui-code"
BRANCH = "main"
SUBDIR = "project-black-dashboard"  # only include files under this folder
OUTPUT_FILE = "project-black-dashboard_files.txt"

API_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/zipball/{BRANCH}"
TOKEN = os.getenv("GITHUB_TOKEN")  # optional but recommended for reliability

session = requests.Session()
headers = {"Accept": "application/vnd.github+json"}
if TOKEN:
    headers["Authorization"] = f"Bearer {TOKEN}"

def main():
    # 1) Download a single ZIP snapshot of the repo
    resp = session.get(API_URL, headers=headers, timeout=60, allow_redirects=True)
    resp.raise_for_status()

    # 2) Read the ZIP in-memory
    z = zipfile.ZipFile(io.BytesIO(resp.content))
    names = z.namelist()
    if not names:
        print("Archive is empty", file=sys.stderr)
        sys.exit(1)

    # 3) Determine the dynamic root folder prefix and target subdir prefix
    root_prefix = names[0].split("/")[0] + "/"
    target_prefix = root_prefix + SUBDIR.strip("/") + "/"

    # 4) Collect all files inside SUBDIR (skip directories)
    file_entries = []
    for name in names:
        if not name.startswith(target_prefix):
            continue
        if name.endswith("/"):
            continue
        rel_path = name[len(target_prefix):]  # path relative to SUBDIR
        if rel_path:
            file_entries.append((name, rel_path.replace("\\", "/")))

    file_entries.sort(key=lambda x: x[1])

    # 5) Write “/relative/path” header, then file content, then delimiter “------ ” between files
    count = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        for i, (zip_name, rel_path) in enumerate(file_entries):
            header_path = "/" + rel_path  # e.g., /components/About.tsx or /App.tsx
            with z.open(zip_name) as f:
                content = f.read().decode("utf-8", errors="replace")

            out.write(f"{header_path}\n")
            out.write(content.rstrip("\n") + "\n")
            if i < len(file_entries) - 1:
                out.write("\n------ \n\n")  # delimiter only between files
            count += 1

    print(f"Wrote {count} files to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
