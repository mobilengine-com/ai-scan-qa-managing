//# server program ai_scan_agent_dashboard for form ai_scan_agent_dashboard
//# using reftab ai_scan_user;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_inprogress;

{
    let stLoggedUserId = form.stLoggedUserId;

    let bChangeOnline = form.bChangeOnline;
    let bChangeOffline = form.bChangeOffline;

    let bGetJob = form.bGetJob;

    let bCancelCurrentAnotJob = form.bCancelCurrentAnotJob;
    let bCancelCurrentQAJob = form.bCancelCurrentQAJob;

    if(bChangeOnline)
    {
        // Update the user in ai_scan_user table
        db.ai_scan_user.UpdateMany({
            id : stLoggedUserId
        },{
            status : "ONLINE"
        });
    }

    if(bChangeOffline)
    {
        // Update the user in ai_scan_user table
        db.ai_scan_user.UpdateMany({
            id : stLoggedUserId
        },{
            status : "OFFLINE"
        });
    }

    if(bGetJob)
    {
        let lstAllUnassignedJobs = db.ai_scan_jobs_history.ReadFields({current_user: "NULL"},["id","current_user","users"]);

        if(lstAllUnassignedJobs.Count() == 0)
        {
            Log("No unassigned job available");
        }
        else
        {
            let stQAJobId = "";

            let lstOtherOnlineUsers = db.ai_scan_user.ReadFields({status: "ONLINE", id: {notEqual : stLoggedUserId}},["id"]);

            let bUserGetQAJob = false;

            for(let recData of lstAllUnassignedJobs)
            {
                let lstQAJob = list.New();
                let lstQAJobHistory = list.New();
                let lstQAJobHistoryUsers = list.New();
                let bQAJobUserFoundInUserHistory = false;

                lstQAJob = db.ai_scan_jobs.ReadFields({id: recData.id, type: "QA", status: {equal : "UNCHECKED"}},["id","type","status"]).SingleOrDefault();

                if(lstQAJob != null)
                {
                    lstQAJobHistory = db.ai_scan_jobs_history.ReadFields({id: recData.id},["users"]).SingleOrDefault();

                    if(lstQAJobHistory.users != "NULL")
                    {
                        Log("nem üres a users");

                        lstQAJobHistoryUsers = lstQAJobHistory.users.Split(",");

                        for(let recDataUser of lstQAJobHistoryUsers)
                        {
                            if(stLoggedUserId == recDataUser)
                            {
                                bQAJobUserFoundInUserHistory = true;
                                break;
                            }
                        }

                        //Get job's delivery note datas
                        let lstGetQAJobDeliveryNote = db.ai_scan_delivery_note_job.ReadFields({job_id: recData.id},["id","delivery_note_id"]);

                        let stGetQAJobDeliveryId = lstGetQAJobDeliveryNote.GetAt(0).id;
                        let stGetQAJobDeliveryNoteId = lstGetQAJobDeliveryNote.GetAt(0).delivery_note_id;

                        //Get delivery note ANOT jobs
                        let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stGetQAJobDeliveryId, delivery_note_id: stGetQAJobDeliveryNoteId, job_id: {notEqual : recData.id}},["job_id"]);

                        //Get delivery note ANOT jobs users

                        let lstDeliveryNoteJobsUsers = list.New();

                        let stDeliveryNoteQAANOTJobsUsers = "";

                        for(let recDataUser of lstDeliveryNoteJobs)
                        {
                            let lstDeliveryNoteJobsUser = db.ai_scan_jobs_history.ReadFields({id: recDataUser.job_id},["current_user"]);
                            let stGetANOTJobCurrentUser = lstDeliveryNoteJobsUser.GetAt(0).current_user;
                            lstDeliveryNoteJobsUsers.Add(stGetANOTJobCurrentUser);
                            stDeliveryNoteQAANOTJobsUsers = stDeliveryNoteQAANOTJobsUsers + stGetANOTJobCurrentUser + ",";
                        }

                        stDeliveryNoteQAANOTJobsUsers = stDeliveryNoteQAANOTJobsUsers.TrimEnd(",");

                        let bCurrentUserFoundInQAANOTJobs = false;

                        for(let recData of lstDeliveryNoteJobsUsers)
                        {
                            if(recData == stLoggedUserId)
                            {
                                bCurrentUserFoundInQAANOTJobs = true;
                            }
                        }

                        let bAllOnlineUserGetQAJob = false;

                        let lstAllOnlineUsers = db.ai_scan_user.ReadFields({status: "ONLINE"},["id"]);

                        for(let recData of lstAllOnlineUsers)
                        {
                            if(stDeliveryNoteQAANOTJobsUsers.IndexOf(recData.id) == -1)
                            {
                                bAllOnlineUserGetQAJob = true;
                                break;
                            }
                        }

                        //Current user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 0)
                        {
                            Log("QA Only you");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 1 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 1 && bCurrentUserFoundInQAANOTJobs == true && bAllOnlineUserGetQAJob == false)
                        {
                            Log("QA Only you + 1 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 1 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 1 && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true)
                        {
                            Log("QA Only you + 1 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 2 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 2 && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true)
                        {
                            Log("QA Only you + 2 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //More than 3 online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() >= 3 && bQAJobUserFoundInUserHistory == false && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true)
                        {
                            Log("More than 3 online user / users not empty");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }
                    }
                    else
                    {
                        Log("NULL a users");
                        //Get job's delivery note datas
                        let lstGetQAJobDeliveryNote = db.ai_scan_delivery_note_job.ReadFields({job_id: recData.id},["id","delivery_note_id"]);

                        let stGetQAJobDeliveryId = lstGetQAJobDeliveryNote.GetAt(0).id;
                        let stGetQAJobDeliveryNoteId = lstGetQAJobDeliveryNote.GetAt(0).delivery_note_id;

                        //Get delivery note ANOT jobs
                        let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stGetQAJobDeliveryId, delivery_note_id: stGetQAJobDeliveryNoteId, job_id: {notEqual : recData.id}},["job_id"]);

                        //Get delivery note ANOT jobs users

                        let lstDeliveryNoteJobsUsers = list.New();

                        let stDeliveryNoteQAANOTJobsUsers = "";

                        for(let recDataUser of lstDeliveryNoteJobs)
                        {
                            let lstDeliveryNoteJobsUser = db.ai_scan_jobs_history.ReadFields({id: recDataUser.job_id},["current_user"]);
                            let stGetANOTJobCurrentUser = lstDeliveryNoteJobsUser.GetAt(0).current_user;
                            lstDeliveryNoteJobsUsers.Add(stGetANOTJobCurrentUser);
                            stDeliveryNoteQAANOTJobsUsers = stDeliveryNoteQAANOTJobsUsers + stGetANOTJobCurrentUser + ",";
                        }

                        stDeliveryNoteQAANOTJobsUsers = stDeliveryNoteQAANOTJobsUsers.TrimEnd(",");

                        let bCurrentUserFoundInQAANOTJobs = false;

                        for(let recData of lstDeliveryNoteJobsUsers)
                        {
                            if(recData == stLoggedUserId)
                            {
                                bCurrentUserFoundInQAANOTJobs = true;
                            }
                        }

                        let bAllOnlineUserGetQAJob = false;

                        let lstAllOnlineUsers = db.ai_scan_user.ReadFields({status: "ONLINE"},["id"]);
                        
                        for(let recData of lstAllOnlineUsers)
                        {
                            if(stDeliveryNoteQAANOTJobsUsers.IndexOf(recData.id) == -1)
                            {
                                bAllOnlineUserGetQAJob = true;
                                break;
                            }
                        }

                        //Current user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 0)
                        {
                            Log("QA Only you");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 1 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 1 && bCurrentUserFoundInQAANOTJobs == true && bAllOnlineUserGetQAJob == false)
                        {
                            Log("QA Only you + 1 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 1 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 1 && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true)
                        {
                            Log("QA Only you + 1 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //Current user and 2 other user only online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() == 2 && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true)
                        {
                            Log("QA Only you + 2 other user");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }

                        //More than 3 online user
                        if(lstQAJob != null && lstOtherOnlineUsers.Count() >= 3 && bCurrentUserFoundInQAANOTJobs == false && bAllOnlineUserGetQAJob == true && stLoggedUserId != lstDeliveryNoteJobsUsers.GetAt(0) && stLoggedUserId != lstDeliveryNoteJobsUsers.GetAt(1))
                        {
                            Log("More than 3 online user / users empty");
                            stQAJobId = recData.id;
                            bUserGetQAJob = true;
                            break;
                        }
                    }
                }
            }

            if(bUserGetQAJob == true)
            {
                Log("QA job found");

                let stCurrentJobUserHistory = "";

                let lstQAJobJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stQAJobId},["users"]);

                for(let recCJUH of lstQAJobJobUserHistory)
                {
                    if(recCJUH.users != "NULL")
                    {
                        stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                    }
                }

                stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stQAJobId
                },{
                    current_user: stLoggedUserId,
                    users: stCurrentJobUserHistory
                });

                // Update the job in ai_scan_jobs table
                db.ai_scan_jobs.UpdateMany({
                    id : stQAJobId
                },{
                    status : "INPROGRESS"
                });

                // Insert OR Update the job in ai_scan_job_inprogress table
                db.ai_scan_job_inprogress.InsertOrUpdate({
                    job_id : stQAJobId
                },{
                    user_id : stLoggedUserId,
                    job_start_time : dtl.Now().DtlToDtdb()
                });
            }
            else
            {
                let stANOTJobId = "";

                let bUserGetANOTJob = false;

                for(let recData2 of lstAllUnassignedJobs)
                {
                    let lstANOTJob = list.New();
                    let lstANOTJobHistory = list.New();
                    let lstANOTJobHistoryUsers = list.New();
                    let bANOTJOBUserFoundInUserHistory = false;
                    let lstANOTOtherJobHistory = list.New();
                    let lstANOTOtherJobHistoryUsers = list.New();
                    let bANOTOtherJOBUserFoundInUserHistory = false;

                    lstANOTJob = db.ai_scan_jobs.ReadFields({id: recData2.id, type: "ANOT", status: {equal : "UNCHECKED"}},["id","type","status"]).SingleOrDefault();

                    if(lstANOTJob != null)
                    {
                        lstANOTJobHistory = db.ai_scan_jobs_history.ReadFields({id: recData2.id},["users"]).SingleOrDefault();

                        if(lstANOTJobHistory.users != "NULL")
                        {
                            lstANOTJobHistoryUsers = lstANOTJobHistory.users.Split(",");

                            for(let recDataUser of lstANOTJobHistoryUsers)
                            {
                                if(stLoggedUserId == recDataUser)
                                {
                                    bANOTJOBUserFoundInUserHistory = true;
                                    break;
                                }
                            }

                            //Get job's delivery note datas
                            let lstGetANOTJobDeliveryNote = db.ai_scan_delivery_note_job.ReadFields({job_id: recData2.id},["id","delivery_note_id"]);

                            let stGetANOTJobDeliveryId = lstGetANOTJobDeliveryNote.GetAt(0).id;
                            let stGetANOTJobDeliveryNoteId = lstGetANOTJobDeliveryNote.GetAt(0).delivery_note_id;

                            //Get delivery note other job
                            let stDeliveryNoteOtherJob = "";

                            let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stGetANOTJobDeliveryId, delivery_note_id: stGetANOTJobDeliveryNoteId},["job_id"]);

                            for(let recDNJ of lstDeliveryNoteJobs)
                            {
                                if(recDNJ.job_id != recData2.id)
                                {
                                    stDeliveryNoteOtherJob = recDNJ.job_id;
                                }
                            }

                            //Get delivery note other job user
                            let stDeliveryNoteOtherJobUser = "";

                            lstANOTOtherJobHistory = db.ai_scan_jobs_history.ReadFields({id: stDeliveryNoteOtherJob},["current_user","users"]).SingleOrDefault();

                            stDeliveryNoteOtherJobUser = lstANOTOtherJobHistory.current_user;

                            if(lstANOTOtherJobHistory.users != "NULL")
                            {
                                lstANOTOtherJobHistoryUsers = lstANOTOtherJobHistory.users.Split(",");

                                for(let recOtherDataUser of lstANOTOtherJobHistoryUsers)
                                {
                                    if(stLoggedUserId == recOtherDataUser)
                                    {
                                        bANOTOtherJOBUserFoundInUserHistory = true;
                                        break;
                                    }
                                }
                            }
                            else
                            {
                                bANOTOtherJOBUserFoundInUserHistory = false;
                            }

                            //Current user only online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() == 0)
                            {
                                Log("Only you");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }

                            //Current user and 1 other user only online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() == 1)
                            {
                                Log("Only you + 1 other user");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }

                            //More than 2 online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() >= 2 && bANOTJOBUserFoundInUserHistory == false && stLoggedUserId != stDeliveryNoteOtherJobUser && bANOTOtherJOBUserFoundInUserHistory == false)
                            {
                                Log("More than 2 online user / users not empty");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }
                        }
                        else
                        {
                            //Get job's delivery note datas
                            let lstGetANOTJobDeliveryNote = db.ai_scan_delivery_note_job.ReadFields({job_id: recData2.id},["id","delivery_note_id"]);

                            let stGetANOTJobDeliveryId = lstGetANOTJobDeliveryNote.GetAt(0).id;
                            let stGetANOTJobDeliveryNoteId = lstGetANOTJobDeliveryNote.GetAt(0).delivery_note_id;

                            //Get delivery note other job
                            let stDeliveryNoteOtherJob = "";

                            let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stGetANOTJobDeliveryId, delivery_note_id: stGetANOTJobDeliveryNoteId},["job_id"]);

                            for(let recDNJ of lstDeliveryNoteJobs)
                            {
                                if(recDNJ.job_id != recData2.id)
                                {
                                    stDeliveryNoteOtherJob = recDNJ.job_id;
                                }
                            }
                            //Get delivery note other job user
                            let stDeliveryNoteOtherJobUser = "";

                            lstANOTOtherJobHistory = db.ai_scan_jobs_history.ReadFields({id: stDeliveryNoteOtherJob},["current_user","users"]).SingleOrDefault();

                            stDeliveryNoteOtherJobUser = lstANOTOtherJobHistory.current_user;

                            if(lstANOTOtherJobHistory.users != "NULL")
                            {
                                lstANOTOtherJobHistoryUsers = lstANOTOtherJobHistory.users.Split(",");

                                for(let recOtherDataUser of lstANOTOtherJobHistoryUsers)
                                {
                                    if(stLoggedUserId == recOtherDataUser)
                                    {
                                        bANOTOtherJOBUserFoundInUserHistory = true;
                                        break;
                                    }
                                }
                            }
                            else
                            {
                                bANOTOtherJOBUserFoundInUserHistory = false;
                            }

                            //Current user only online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() == 0)
                            {
                                Log("Only you");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }

                            //Current user and 1 other user only online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() == 1)
                            {
                                Log("Only you + 1 other user");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }

                            //More than 2 online user
                            if(lstANOTJob != null && lstOtherOnlineUsers.Count() >= 2 && stLoggedUserId != stDeliveryNoteOtherJobUser && bANOTOtherJOBUserFoundInUserHistory == false)
                            {
                                Log("More than 2 online user / users empty");
                                stANOTJobId = recData2.id;
                                bUserGetANOTJob = true;
                                break;
                            }
                        }
                    }
                }

                if(bUserGetANOTJob == true)
                {
                    Log("ANOT job found");
                    let stCurrentJobUserHistory = "";

                    let lstANOTJobJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stANOTJobId},["users"]);

                    for(let recCJUH of lstANOTJobJobUserHistory)
                    {
                        if(recCJUH.users != "NULL")
                        {
                            stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                        }
                    }

                    stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stANOTJobId
                    },{
                        current_user: stLoggedUserId,
                        users: stCurrentJobUserHistory
                    });

                    // Update the job in ai_scan_jobs table
                    db.ai_scan_jobs.UpdateMany({
                        id : stANOTJobId
                    },{
                        status : "INPROGRESS"
                    });

                    // Insert OR Update the job in ai_scan_job_inprogress table
                    db.ai_scan_job_inprogress.InsertOrUpdate({
                        job_id : stANOTJobId
                    },{
                        user_id : stLoggedUserId,
                        job_start_time : dtl.Now().DtlToDtdb()
                    });
                }                
                else
                {
                    Log("No job found current user");
                }
            }
        }
    }

    if(bCancelCurrentAnotJob)
    {
        // Update current job history with new online user
        let stCurrentJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs_history table
        db.ai_scan_jobs_history.UpdateMany({
            id: stCurrentJobId
        },{
            current_user: "NULL"
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentJobId
        },{
            status : "UNCHECKED"
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});
    }

    if(bCancelCurrentQAJob)
    {
        // Update current job history with new online user
        let stCurrentQAJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs_history table
        db.ai_scan_jobs_history.UpdateMany({
            id: stCurrentQAJobId
        },{
            current_user: "NULL"
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED"
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
    }
}