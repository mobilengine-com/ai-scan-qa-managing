//# server program ai_scan_agent_dashboard for form ai_scan_agent_dashboard
//# using reftab ai_scan_user;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_user_language;

{
    let stLoggedUserId = form.stLoggedUserId;

    let bChangeOnline = form.bChangeOnline;
    let bChangeOffline = form.bChangeOffline;

    let bGetJob = form.bGetJob;

    let bCancelCurrentAnotJob = form.bCancelCurrentAnotJob;
    let bCancelCurrentQAJob = form.bCancelCurrentQAJob;

    let bCancelDelayCurrentAnotJob = form.bCancelDelayCurrentAnotJob;
    let bCancelDelayCurrentQAJob = form.bCancelDelayCurrentQAJob;

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
        //All unassigned jobs
        let lstAllUnassignedJobs = db.ai_scan_jobs.ReadFields({current_user: null},["id","type","status","lang","current_user","delay_time"]);

        if(lstAllUnassignedJobs.Count() == 0)
        {
            Log("No unassigned job available");
        }
        else
        {
            //Find QA jobs in unassigned jobs
            let dtlTimeNow = dtl.Now();

            let stCurrentQAJobId = "";

            let lstOtherOnlineUsers = db.ai_scan_user.ReadFields({status: "ONLINE", id: {notEqual : stLoggedUserId}},["id"]);

            let bUserGetCurrentQAJob = false;            

            for(let recData of lstAllUnassignedJobs)
            {
                //Get current user QA language tpye
                let stCurrentUserQAHUNLanguage = "";
                let stCurrentUserQAENGLanguage = "";
                let stCurrentUserQAPLLanguage = "";

                for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "hu_hu", job_type: "QA"},["lang"]))
                {
                    stCurrentUserQAHUNLanguage = recUserLang.lang;
                }

                for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "eng_eng", job_type: "QA"},["lang"]))
                {
                    stCurrentUserQAENGLanguage = recUserLang.lang;
                }

                for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "pl_pl", job_type: "QA"},["lang"]))
                {
                    stCurrentUserQAPLLanguage = recUserLang.lang;
                }

                if(recData.type == "QA" && recData.status == "UNCHECKED" && (recData.delay_time == null || dtlTimeNow > recData.delay_time.DeclareAsDtl()) && (recData.lang == stCurrentUserQAHUNLanguage || recData.lang == stCurrentUserQAENGLanguage || recData.lang == stCurrentUserQAPLLanguage))
                {
                    //Find oldest QA job
                    //Get current job's ANOT jobs
                    let lstGetCurrentQAJobANNOTJobs = db.ai_scan_jobs.ReadFields({id: recData.id},["job_id_2","job_id_3"]);

                    let stGetCurrentQAJobANNOTJob1 = "";
                    let stGetCurrentQAJobANNOTJob2 = "";

                    for(let recData of lstGetCurrentQAJobANNOTJobs)
                    {
                        stGetCurrentQAJobANNOTJob1 = recData.job_id_2;
                        stGetCurrentQAJobANNOTJob2 = recData.job_id_3;
                        break;
                    }

                    //Get current job's ANOT jobs users
                    let lstGetCurrentQAJobANNOTJobsUsers = db.ai_scan_job_result.ReadFields({job_id: [stGetCurrentQAJobANNOTJob1,stGetCurrentQAJobANNOTJob2]},["user_id"]);

                    //Get current delivery note ANOT jobs users
                    let lstCurrentQAJobDeliveryNoteANOTJobsUsers = list.New();

                    let stCurrentQAJobDeliveryNoteANOTJobsUsers = "";

                    for(let recDataUser of lstGetCurrentQAJobANNOTJobsUsers)
                    {
                        let stCurrentQAJobGetANOTJobCurrentUser = recDataUser.user_id;
                        lstCurrentQAJobDeliveryNoteANOTJobsUsers.Add(stCurrentQAJobGetANOTJobCurrentUser);
                        stCurrentQAJobDeliveryNoteANOTJobsUsers = stCurrentQAJobDeliveryNoteANOTJobsUsers + stCurrentQAJobGetANOTJobCurrentUser + ",";
                    }

                    stCurrentQAJobDeliveryNoteANOTJobsUsers = stCurrentQAJobDeliveryNoteANOTJobsUsers.TrimEnd(",");

                    //If current user anotated one of the ANOT jobs
                    let bCurrentUserFoundInCurrentQAJobANOTJobs = false;

                    for(let recData of lstCurrentQAJobDeliveryNoteANOTJobsUsers)
                    {
                        if(recData == stLoggedUserId)
                        {
                            bCurrentUserFoundInCurrentQAJobANOTJobs = true;
                        }
                    }

                    //If other online user didn't anotated one of the ANOT jobs
                    let bOtherOnlineUserGetQAJob = false;

                    for(let recData of lstOtherOnlineUsers)
                    {
                        if(stCurrentQAJobDeliveryNoteANOTJobsUsers.IndexOf(recData.id) == -1)
                        {
                            bOtherOnlineUserGetQAJob = true;
                            break;
                        }
                    }

                    //Current user and 1 other user only online user or Current user only user / other user can do this job because didn't do anot jobs
                    if(lstAllUnassignedJobs != null && lstOtherOnlineUsers.Count() <= 1 && bCurrentUserFoundInCurrentQAJobANOTJobs == true && bOtherOnlineUserGetQAJob == false)
                    {
                        Log("QA Only you + 1 other user");
                        stCurrentQAJobId = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //Current user and 1 other user only online user or Current user only user / you can do this job because didn't do anot jobs
                    if(lstAllUnassignedJobs != null && lstOtherOnlineUsers.Count() <= 1 && bCurrentUserFoundInCurrentQAJobANOTJobs == false && bOtherOnlineUserGetQAJob == true)
                    {
                        Log("QA Only you + 1 other user");
                        stCurrentQAJobId = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //More or equal 3 online user
                    if(lstAllUnassignedJobs != null && lstOtherOnlineUsers.Count() >= 2 && bCurrentUserFoundInCurrentQAJobANOTJobs == false)
                    {
                        Log("More or equal than 3 online user / users not empty");
                        stCurrentQAJobId = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }
                }
            }

            if(bUserGetCurrentQAJob == true)
            {
                Log("QA job found for current user");

                //Current user save in current job user history

                let stCurrentJobUserHistory = "";

                let lstQAJobJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                for(let recCJUH of lstQAJobJobUserHistory)
                {
                    if(recCJUH.users != null)
                    {
                        stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                    }
                }

                stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentQAJobId
                },{
                    users: stCurrentJobUserHistory
                });

                // Update the job in ai_scan_jobs table
                db.ai_scan_jobs.UpdateMany({
                    id : stCurrentQAJobId
                },{
                    status : "INPROGRESS",
                    current_user: stLoggedUserId
                });

                // Insert OR Update the job in ai_scan_job_inprogress table
                db.ai_scan_job_inprogress.InsertOrUpdate({
                    job_id : stCurrentQAJobId
                },{
                    user_id : stLoggedUserId,
                    job_start_time : dtl.Now().DtlToDtdb()
                });
            }
            else
            {
                //Find ANOT jobs in unassigned jobs if no QA jobs in unassigned jobs
                let stCurrentANOTJobId = "";

                let bUserGetCurrentANOTJob = false;

                for(let recData2 of lstAllUnassignedJobs)
                {

                    //Get current user ANOT language tpye
                    let stCurrentUserANOTHUNLanguage = "";
                    let stCurrentUserANOTENGLanguage = "";
                    let stCurrentUserANOTPLLanguage = "";

                    for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "hu_hu", job_type: "ANOT"},["lang"]))
                    {
                        stCurrentUserANOTHUNLanguage = recUserLang.lang;
                    }

                    for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "eng_eng", job_type: "ANOT"},["lang"]))
                    {
                        stCurrentUserANOTENGLanguage = recUserLang.lang;
                    }

                    for(let recUserLang of db.ai_scan_user_language.ReadFields({user_id: stLoggedUserId, lang: "pl_pl", job_type: "ANOT"},["lang"]))
                    {
                        stCurrentUserANOTPLLanguage = recUserLang.lang;
                    }

                    if(recData2.type == "ANOT" && recData2.status == "UNCHECKED" && (recData2.delay_time == null || dtlTimeNow > recData2.delay_time.DeclareAsDtl()) && (recData2.lang == stCurrentUserANOTHUNLanguage || recData2.lang == stCurrentUserANOTENGLanguage || recData2.lang == stCurrentUserANOTPLLanguage))
                    {
                        //Get current job's delivery note datas
                        let lstGetCurrentANOTJobDeliveryNote = db.ai_scan_delivery_note_job.ReadFields({job_id: recData2.id},["id","delivery_note_id"]);

                        let stGetCurrentANOTJobDeliveryNoteId = lstGetCurrentANOTJobDeliveryNote.GetAt(0).delivery_note_id;

                        //Get current delivery note other job
                        let stCurrentDeliveryNoteOtherJobId = "";

                        let lstDeliveryNoteOtherJobs = db.ai_scan_delivery_note_job.ReadFields({delivery_note_id: stGetCurrentANOTJobDeliveryNoteId},["job_id"]);

                        for(let recDNJ of lstDeliveryNoteOtherJobs)
                        {
                            if(recDNJ.job_id != recData2.id)
                            {
                                stCurrentDeliveryNoteOtherJobId = recDNJ.job_id;
                            }
                        }

                        //Get current delivery note other job's current_user variable and users history
                        let lstCurrentANOTJobOtherANOTJob = list.New();
                        let stDeliveryNoteOtherJobCurrentUser = "";

                        lstCurrentANOTJobOtherANOTJob = db.ai_scan_jobs.ReadFields({id: stCurrentDeliveryNoteOtherJobId},["current_user"]).SingleOrDefault();

                        stDeliveryNoteOtherJobCurrentUser = lstCurrentANOTJobOtherANOTJob.current_user;

                        //If current user current job avaiable for him/her
                        if(lstAllUnassignedJobs != null && stLoggedUserId != stDeliveryNoteOtherJobCurrentUser)
                        {
                            Log("Current user will get ANOT job / users variable empty");
                            stCurrentANOTJobId = recData2.id;
                            bUserGetCurrentANOTJob = true;
                            break;
                        }
                    }
                }

                if(bUserGetCurrentANOTJob == true)
                {
                    Log("ANOT job found for current user");

                    //Current user save in current job user history
                    let stCurrentJobUserHistory = "";

                    let lstCurrentANOTJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentANOTJobId},["users"]);

                    for(let recCJUH of lstCurrentANOTJobUserHistory)
                    {
                        if(recCJUH.users != null)
                        {
                            stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                        }
                    }

                    stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentANOTJobId
                    },{
                        users: stCurrentJobUserHistory
                    });

                    // Update the job in ai_scan_jobs table
                    db.ai_scan_jobs.UpdateMany({
                        id : stCurrentANOTJobId
                    },{
                        status : "INPROGRESS",
                        current_user: stLoggedUserId
                    });

                    // Insert OR Update the job in ai_scan_job_inprogress table
                    db.ai_scan_job_inprogress.InsertOrUpdate({
                        job_id : stCurrentANOTJobId
                    },{
                        user_id : stLoggedUserId,
                        job_start_time : dtl.Now().DtlToDtdb()
                    });
                }                
                else
                {
                    Log("No ANOT/QA job found to current user");
                }
            }
        }
    }

    if(bCancelCurrentAnotJob)
    {
        // Update current job history with new online user
        let stCurrentJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentJobId
        },{
            status : "UNCHECKED",
            current_user: null
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});
    }

    if(bCancelDelayCurrentAnotJob)
    {
        // Update current job history with new online user
        let stCurrentJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentJobId
        },{
            status : "UNCHECKED",
            current_user: null,
            delay_time: dtl.Now().DtlAddHours(1).DtlToDtdb()
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});
    }

    if(bCancelCurrentQAJob)
    {
        // Update current job history with new online user
        let stCurrentQAJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED",
            current_user: null
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
    }

    if(bCancelDelayCurrentQAJob)
    {
        // Update current job history with new online user
        let stCurrentQAJobId = form.stLoggedUserSelectedJobId;
        let stCurrentUser = stLoggedUserId;

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED",
            current_user: null,
            delay_time: dtl.Now().DtlAddHours(1).DtlToDtdb()
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
    }
}