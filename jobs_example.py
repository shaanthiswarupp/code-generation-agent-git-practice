def get_jobs():
    jobs = [
        {"id": 1, "title": "Create API", "status": "COMPLETED"},
        {"id": 2, "title": "Test API", "status": "PENDING"}
    ]
    return jobs


def get_job_by_id(job_id):
    jobs = get_jobs()
    for job in jobs:
        if job["id"] == job_id:
            return job
    return None


def get_total_jobs():
    jobs = get_jobs()
    return len(jobs)


def get_jobs_by_title(title):
    jobs = get_jobs()
    return [job for job in jobs if job["title"].lower() == title.lower()]


def get_completed_jobs():
    jobs = get_jobs()
    return [job for job in jobs if job["status"] == "COMPLETED"]


if __name__ == "__main__":
    print(get_jobs())