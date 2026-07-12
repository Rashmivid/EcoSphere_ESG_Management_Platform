import os
import subprocess
import datetime

# 1. Define the 4 personas: 1 Admin + 3 Collaborators
AUTHORS = [
    {"name": "EcoSphere Admin", "email": "admin@ecosphere.io"},
    {"name": "Sarah Miller (Dev)", "email": "sarah.m@ecosphere.io"},
    {"name": "Raj Patel (Dev)", "email": "raj.p@ecosphere.io"},
    {"name": "Elena Rostova (QA)", "email": "elena.r@ecosphere.io"}
]

# 2. Configure start date (e.g., 5 days ago to allow for sequential hourly commits)
START_TIME = datetime.datetime.now() - datetime.timedelta(days=5)

# 3. Define paths to ignore
IGNORE_DIRS = {".git", "node_modules", "venv", "__pycache__", ".idea", ".vscode", "dist", "build"}
IGNORE_FILES = {
    ".gitignore", "package-lock.json", "make_history.py", 
    ".env", ".env.example", "docker-compose.yml"
}

def get_all_files():
    file_list = []
    for root, dirs, files in os.walk("."):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f not in IGNORE_FILES:
                rel_path = os.path.relpath(os.path.join(root, f), ".")
                # Normalize paths to use forward slashes for cross-platform safety
                normalized_path = rel_path.replace(os.sep, "/")
                file_list.append(normalized_path)
    return sorted(file_list)

def main():
    files = get_all_files()
    if not files:
        print("No files found to commit!")
        return
        
    print(f"Found {len(files)} files to commit.")
    
    # Initialize Git repository if it hasn't been initialized yet
    if not os.path.exists(".git"):
        subprocess.run(["git", "init"], check=True)
        print("Initialized a new Git repository.")

    current_time = START_TIME
    
    for idx, filepath in enumerate(files):
        # Rotate through the 4 author personas
        author = AUTHORS[idx % len(AUTHORS)]
        
        # Advance time by 1 hour for each file
        current_time += datetime.timedelta(hours=1)
        formatted_date = current_time.isoformat()
        
        # Stage the file
        subprocess.run(["git", "add", filepath], check=True)
        
        # Override Git environment variables to force custom author, committer, and timestamps
        env = os.environ.copy()
        env["GIT_AUTHOR_NAME"] = author["name"]
        env["GIT_AUTHOR_EMAIL"] = author["email"]
        env["GIT_AUTHOR_DATE"] = formatted_date
        env["GIT_COMMITTER_NAME"] = author["name"]
        env["GIT_COMMITTER_EMAIL"] = author["email"]
        env["GIT_COMMITTER_DATE"] = formatted_date
        
        commit_message = f"feat: set up/update {filepath.split('/')[-1]} modules"
        
        # Execute the commit
        subprocess.run(["git", "commit", "-m", commit_message], env=env, check=True)
        print(f"Committed: {filepath} | By: {author['name']} | Date: {formatted_date}")

    print("\nSUCCESS! Generated commit history.")
    print("Now you can push to your GitHub repository using:")
    print("  git remote add origin <your-github-repo-url>")
    print("  git branch -M main")
    print("  git push -u origin main --force")

if __name__ == "__main__":
    main()
