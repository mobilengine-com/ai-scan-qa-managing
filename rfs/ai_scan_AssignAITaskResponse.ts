//# server program ai_scan_AssignAITaskResponse for dacs AssignAITaskResponse
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_jobs_history;
{
    Log(dacs);
    let stCurrentJobId = dacs.response.requestFileId;
    if (dacs.response.success == 1) {
        db.ai_scan_jobs.InsertOrUpdate({
            id : stCurrentJobId
        },{
            assigned : 1
        });
        Log("Succesfully assigned job: " + stCurrentJobId);

        db.ai_scan_jobs_history.UpdateMany({
            id: stCurrentJobId
        },{
            job_assigned_status: "success"
        });
    }else{
        Log("Assignment failed for job: " + stCurrentJobId);
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentJobId
        },{
            status : "UNCHECKED",
            current_user: null,
            assigned: 0
        });
        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId});

        db.ai_scan_jobs_history.UpdateMany({
            id: stCurrentJobId
        },{
            job_assigned_status: "failed"
        });
    }
}