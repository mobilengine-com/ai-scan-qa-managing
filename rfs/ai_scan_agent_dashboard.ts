//# server typescript program ai_scan_agent_dashboard for form ai_scan_agent_dashboard
//# using reftab ai_scan_user;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_user_language;
//# using reftab ai_scan_settings;
//# using dacs AssignAITask;

{
    let fGetJob = function () {

        let bUserGetCurrentQAJob = false;
        let bUserGetCurrentANOTJob = false;

        let stJob_id = "";
		
        //All unassigned QA jobs
        let lstAllUnassignedQAJobs = db.ai_scan_jobs.ReadFields({type: "QA", status: "UNCHECKED", current_user: null},["id","type","status","lang","current_user","delivery_note_work_start_date","delay_time"]);

        if(lstAllUnassignedQAJobs.Count() == 0)
        {
            Log("No unassigned QA job available");
        }
        else
        {
            //Find oldest QA jobs in unassigned jobs and ASC order
            if(lstAllUnassignedQAJobs.Count() >= 2)
            {
                let bWasChanged = true;

                for (let i = (lstAllUnassignedQAJobs.Count())-1; i > 0 && bWasChanged; i = i-1)
                {
                    bWasChanged = false;
                    for (let j = 0; j < i; j = j+1)
                    {
                        if(lstAllUnassignedQAJobs[j].delivery_note_work_start_date.DeclareAsDtl() > lstAllUnassignedQAJobs[j+1].delivery_note_work_start_date.DeclareAsDtl())
                        {
                            let lstTmp = lstAllUnassignedQAJobs[j];
                            lstAllUnassignedQAJobs[j] = lstAllUnassignedQAJobs[j+1];
                            lstAllUnassignedQAJobs[j+1] = lstTmp;
                            bWasChanged = true;
                        }
                    }
                }
            }

            let lstOtherOnlineUsers = db.ai_scan_user.ReadFields({status: "ONLINE", id: {notEqual : stLoggedUserId}},["id"]);            

            for(let recData of lstAllUnassignedQAJobs)
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
                let iOtherUsersWithTheCorrectLang = 0;
                let lsUsersWithRequiredLang = list.New();
                for (let userRow of  db.ai_scan_user_language.ReadFields({lang: recData.lang, job_type: "QA"},["user_id"])) {
                    lsUsersWithRequiredLang.Add(userRow.user_id);
                }
                
                for (let userid of lstOtherOnlineUsers) {
                    for (let userwl of lsUsersWithRequiredLang) {
                        if (userid.id == userwl) {
                            iOtherUsersWithTheCorrectLang=iOtherUsersWithTheCorrectLang+1;
                        }
                    }
                }

                if(recData.type == "QA" && recData.status == "UNCHECKED" && (recData.delay_time == null || dtlTimeNow > recData.delay_time.DeclareAsDtl()) && (recData.lang == stCurrentUserQAHUNLanguage || recData.lang == stCurrentUserQAENGLanguage || recData.lang == stCurrentUserQAPLLanguage))
                {
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

                    //QA job assigned because the current user is not assigned in the past to the parent Annot jobs
                    if(lstAllUnassignedQAJobs != null && bCurrentUserFoundInCurrentQAJobANOTJobs == false)
                    {
                        Log("QA job assigned because the user is not assigned in the past to the parent Annot jobs");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //Current user and 1 other user only online user or Current user only user with correct lang / other user can do this job because didn't do anot jobs
                    if(lstAllUnassignedQAJobs != null && iOtherUsersWithTheCorrectLang <= 1 && bCurrentUserFoundInCurrentQAJobANOTJobs == true && bOtherOnlineUserGetQAJob == false)
                    {
                        Log("QA Only you + 0 or 1 other user with correct lang / other user can do this job because didn't do anot jobs");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //Current user and 1 other user only online user or Current user only user with correct lang / you can do this job because didn't do anot jobs
                    if(lstAllUnassignedQAJobs != null && iOtherUsersWithTheCorrectLang <= 1 && bCurrentUserFoundInCurrentQAJobANOTJobs == false && bOtherOnlineUserGetQAJob == true)
                    {
                        Log("QA Only you + 0 or 1 other user with correct lang / you can do this job because didn't do anot jobs");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //Current user and 1 other user only online user with correct lang
                    if(lstAllUnassignedQAJobs != null && iOtherUsersWithTheCorrectLang == 1 && bCurrentUserFoundInCurrentQAJobANOTJobs == true && bOtherOnlineUserGetQAJob == true)
                    {
                        Log("QA Only you + 1 other user with correct lang");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //Current user only online user with correct lang
                    if(lstAllUnassignedQAJobs != null && iOtherUsersWithTheCorrectLang == 0 && bCurrentUserFoundInCurrentQAJobANOTJobs == true && bOtherOnlineUserGetQAJob == true)
                    {
                        Log("QA Only you with correct lang");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }

                    //More or equal 3 online user with correct lang
                    if(lstAllUnassignedQAJobs != null && lstOtherOnlineUsers.Count() >= 2 && iOtherUsersWithTheCorrectLang >= 2 && bCurrentUserFoundInCurrentQAJobANOTJobs == false)
                    {
                        Log("More or equal than 3 online user with correct lang / users not empty");
                        stJob_id = recData.id;
                        bUserGetCurrentQAJob = true;
                        break;
                    }
                }
            }

            if(bUserGetCurrentQAJob == true)
            {
                Log("QA job found for current user");
            }
            else
            {
                Log("No QA job found to current user");
            }
        }

        //All unassigned ANOT jobs
        let lstAllUnassignedANOTJobs = db.ai_scan_jobs.ReadFields({type: "ANOT", status: "UNCHECKED", current_user: null},["id","type","status","lang","current_user","delivery_note_work_start_date","delay_time"]);

        if(lstAllUnassignedANOTJobs.Count() == 0 || bUserGetCurrentQAJob == true)
        {
            Log("No unassigned ANOT job available or current user get QA job");
        }
        else
        {
            //Find oldest ANOT jobs in unassigned jobs and ASC order if no QA jobs in unassigned jobs
            if(lstAllUnassignedANOTJobs.Count() >= 2)
            {
                let bWasChanged = true;

                for (let i = (lstAllUnassignedANOTJobs.Count())-1; i > 0 && bWasChanged; i = i-1)
                {
                    bWasChanged = false;
                    for (let j = 0; j < i; j = j+1)
                    {
                        if(lstAllUnassignedANOTJobs[j].delivery_note_work_start_date.DeclareAsDtl() > lstAllUnassignedANOTJobs[j+1].delivery_note_work_start_date.DeclareAsDtl())
                        {
                            let lstTmp = lstAllUnassignedANOTJobs[j];
                            lstAllUnassignedANOTJobs[j] = lstAllUnassignedANOTJobs[j+1];
                            lstAllUnassignedANOTJobs[j+1] = lstTmp;
                            bWasChanged = true;
                        }
                    }
                }
            }

            for(let recData2 of lstAllUnassignedANOTJobs)
            {
                Log("DEBUG");
                Log(recData2.id);
                Log(recData2.status);

                //If current job has result in ai_scan_job_result reftab
                let lstAnotJobResult = db.ai_scan_job_result.ReadFields({job_id: recData2.id},["user_id","result"]);

                if(lstAnotJobResult.Count() == 0)
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

                    // Get current job other job id
                    let lstDeliveryNoteOtherJobs = db.ai_scan_jobs.ReadFields({id: recData2.id},["job_id_2"]);

                    let stCurrentDeliveryNoteOtherJobId = "";

                    for(let recOtherJob of lstDeliveryNoteOtherJobs)
                    {
                        if(recOtherJob.job_id_2 != recData2.id)
                        {
                            stCurrentDeliveryNoteOtherJobId = recOtherJob.job_id_2;
                        }
                    }

                    //Get current delivery note other job's current_user variable and delay time
                    let stDeliveryNoteOtherJobCurrentUser = "";
                    let dtlDeliveryNoteOtherJobDelayTime = null;

                    let lstCurrentANOTJobOtherANOTJob = db.ai_scan_jobs.ReadFields({id: stCurrentDeliveryNoteOtherJobId},["current_user","delay_time"]).SingleOrDefault();

                    stDeliveryNoteOtherJobCurrentUser = lstCurrentANOTJobOtherANOTJob.current_user;

                    if(lstCurrentANOTJobOtherANOTJob.delay_time != null)
                    {
                        dtlDeliveryNoteOtherJobDelayTime = lstCurrentANOTJobOtherANOTJob.delay_time.DeclareAsDtl();
                    }

                    if(stLoggedUserId != stDeliveryNoteOtherJobCurrentUser && (dtlDeliveryNoteOtherJobDelayTime == null || dtlTimeNow > dtlDeliveryNoteOtherJobDelayTime) && recData2.type == "ANOT" && recData2.status == "UNCHECKED" && (recData2.delay_time == null || dtlTimeNow > recData2.delay_time.DeclareAsDtl()) && (recData2.lang == stCurrentUserANOTHUNLanguage || recData2.lang == stCurrentUserANOTENGLanguage || recData2.lang == stCurrentUserANOTPLLanguage))
                    {
                        stJob_id = recData2.id;
                        bUserGetCurrentANOTJob = true;
                        break;
                    }
                }
                else
                {
                    //current job has result datas and somehow set to unchecked
                    //set back to done status
                    Log("set back to done status");
                    db.ai_scan_jobs.UpdateMany({
                        id: recData2.id
                    },{
                        status: "DONE",
                        current_user: lstAnotJobResult.GetAt(0).user_id,
                        delay_time: null
                    });

                }
                
            }

            if(bUserGetCurrentANOTJob == true)
            {
                Log("ANOT job found for current user");
            }
            else
            {
                Log("No ANOT job found to current user");
            }
        } 
		
		return stJob_id;
	};

    let dtlTimeNow = dtl.Now();

    let stDelayTime = form.stDelayTime;

    if(stDelayTime == null || stDelayTime == "")
    {
        stDelayTime = "1";
    }

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

        // If switch back to offline and current user has inprogress job then cancel the inprogress job
        // Update current job history with new online user

        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stLoggedUserId},["job_id"]);
        if(lstUserInprogressJob.Count() != 0)
        {
            let stCurrentJobId = lstUserInprogressJob.GetAt(0).job_id;

            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (Current user inprogress Job set to unchecked because logout)
            Log("DEBUG");
            Log(stCurrentUser);
            Log(stCurrentJobId);
            Log("Current user inprogress Job set to unchecked because logout / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentJobId
            },{
                status : "UNCHECKED",
                current_user: null,
                assigned: 0
            });
            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});

            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentJobId
            },{
                job_assigned_status: ""
            });

            //Remove user from ANNOT job on AI page
            let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stCurrentJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
            let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;
            
            let dacs = messages.AssignAITask.New();
            dacs.assignTask.scanId = stscanId;
            dacs.assignTask.requestFileId = stCurrentJobId;
            dacs.assignTask.agent = stDefaultAIUser;
            //dacs.assignTask.agent = "botond.bakai@mobilengine.com";
            dacs.Send();
        }
    }

    if(bGetJob)
    {
        let stGetJobId = "";
        let bGetJob = false;

        stGetJobId = fGetJob();

        Log("stGetJobId value:");
        Log(stGetJobId);

        if(stGetJobId != "" || stGetJobId != null)
        {
            let lstJobIdRecheck = db.ai_scan_jobs.ReadFields({id: stGetJobId, status: "UNCHECKED"},["type"]);
            let iJobIdRecheckCount = lstJobIdRecheck.Count();
            Log("Recheck Count Result:");
            Log(iJobIdRecheckCount);
            if(iJobIdRecheckCount != 0)
            {
                if(lstJobIdRecheck.GetAt(0).type == "QA")
                {
                    Log("QA job found for current user");

                    //Current user save in current job user history

                    let stCurrentJobUserHistory = "";

                    let lstQAJobJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stGetJobId},["users"]);

                    for(let recCJUH of lstQAJobJobUserHistory)
                    {
                        if(recCJUH.users != null)
                        {
                            stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                        }
                    }

                    stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stGetJobId
                    },{
                        users: stCurrentJobUserHistory
                    });

                    //DEBUG Log (Get QA job)
                    Log("DEBUG");
                    Log(stLoggedUserId);
                    Log(stGetJobId);
                    Log("Get QA job / status -> INPROGRESS");

                    // Update the job in ai_scan_jobs table
                    db.ai_scan_jobs.UpdateMany({
                        id : stGetJobId
                    },{
                        status : "INPROGRESS",
                        current_user: stLoggedUserId,
                        delay_time: null
                    });

                    // Insert OR Update the job in ai_scan_job_inprogress table
                    db.ai_scan_job_inprogress.InsertOrUpdate({
                        job_id : stGetJobId
                    },{
                        user_id : stLoggedUserId,
                        job_start_time : dtl.Now().DtlToDtdb()
                    });
                }

                if(lstJobIdRecheck.GetAt(0).type == "ANOT")
                {
                    Log("ANOT job found for current user");

                    //Current user save in current job user history
                    let stCurrentJobUserHistory = "";

                    let lstCurrentANOTJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stGetJobId},["users"]);

                    for(let recCJUH of lstCurrentANOTJobUserHistory)
                    {
                        if(recCJUH.users != null)
                        {
                            stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                        }
                    }

                    stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stGetJobId
                    },{
                        users: stCurrentJobUserHistory
                    });

                    //DEBUG Log (Get ANOT job)
                    Log("DEBUG");
                    Log(stLoggedUserId);
                    Log(stGetJobId);
                    Log("Get ANOT job / status -> INPROGRESS");

                    // Update the job in ai_scan_jobs table
                    db.ai_scan_jobs.UpdateMany({
                        id : stGetJobId
                    },{
                        status : "INPROGRESS",
                        current_user: stLoggedUserId,
                        delay_time: null
                    });

                    let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stGetJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
                    let stUserMail = db.ai_scan_user.ReadFields({id : stLoggedUserId},["email"]).SingleOrDefault().email;

                    Log("AI task assignement sended for user: " + stUserMail +" with the following annot job id: " + stGetJobId);
                    let dacs = messages.AssignAITask.New();
                    dacs.assignTask.scanId = stscanId;
                    dacs.assignTask.requestFileId = stGetJobId;
                    dacs.assignTask.agent = stUserMail;
                    //dacs.assignTask.agent = "botond.bakai@mobilengine.com";
                    dacs.Send();

                    db.ai_scan_job_inprogress.InsertOrUpdate({
                        job_id : stGetJobId
                    },{
                        user_id : stLoggedUserId,
                        job_start_time : dtl.Now().DtlToDtdb()
                    });
                }

                bGetJob = true;
            }
        }

        if(bGetJob == false)
        {
            Log("after FIFO try user job assigment but user can't get job!");
        }
    }

    if(bCancelCurrentAnotJob)
    {
        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stLoggedUserId},["job_id"]);
        if(lstUserInprogressJob.Count() != 0)
        {
            // Update current job history with new online user
            let stCurrentJobId = lstUserInprogressJob.GetAt(0).job_id;

            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (CANCEL Current ANOT job)
            Log("DEBUG");
            Log(stCurrentUser);
            Log(stCurrentJobId);
            Log("CANCEL Current ANOT job / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentJobId
            },{
                status : "UNCHECKED",
                current_user: null,
                assigned: 0
            });
            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});

            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentJobId
            },{
                job_assigned_status: ""
            });

            //Remove user from ANNOT job on AI page
            let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stCurrentJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
            let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;
            
            let dacs = messages.AssignAITask.New();
            dacs.assignTask.scanId = stscanId;
            dacs.assignTask.requestFileId = stCurrentJobId;
            dacs.assignTask.agent = stDefaultAIUser;
            //dacs.assignTask.agent = "botond.bakai@mobilengine.com";
            dacs.Send();
        }
    }

    if(bCancelDelayCurrentAnotJob)
    {
        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stLoggedUserId},["job_id"]);
        if(lstUserInprogressJob.Count() != 0)
        {
            let dtlDelayTime = dtl.Now().DtlAddHours(int.Parse(stDelayTime)).DtlToDtdb();

            // Update current job history with new online user
            let stCurrentJobId = lstUserInprogressJob.GetAt(0).job_id;

            let stCurrentUser = stLoggedUserId;

            // Get current job other job id
            let lstDeliveryNoteOtherJobs = db.ai_scan_jobs.ReadFields({id: stCurrentJobId},["job_id_2"]);

            let stCurrentDeliveryNoteOtherJobId = "";

            for(let recOtherJob of lstDeliveryNoteOtherJobs)
            {
                if(recOtherJob.job_id_2 != stCurrentJobId)
                {
                    stCurrentDeliveryNoteOtherJobId = recOtherJob.job_id_2;
                }
            }

            //DEBUG Log (DELAY Current ANOT job)
            Log("DEBUG");
            Log(stCurrentUser);
            Log(stCurrentJobId);
            Log("DELAY Current ANOT job / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentJobId
            },{
                status : "UNCHECKED",
                current_user: null,
                delay_time: dtlDelayTime,
                assigned: 0
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentJobId, user_id : stCurrentUser});

            // Add delay time to other job
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentDeliveryNoteOtherJobId
            },{
                delay_time: dtlDelayTime
            });

            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentJobId
            },{
                job_assigned_status: ""
            });

            //Remove user from ANNOT job on AI page
            let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stCurrentJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
            let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;
            
            let dacs = messages.AssignAITask.New();
            dacs.assignTask.scanId = stscanId;
            dacs.assignTask.requestFileId = stCurrentJobId;
            dacs.assignTask.agent = stDefaultAIUser;
            //dacs.assignTask.agent = "botond.bakai@mobilengine.com";
            dacs.Send();
        }
    }

    if(bCancelCurrentQAJob)
    {
        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stLoggedUserId},["job_id"]);
        if(lstUserInprogressJob.Count() != 0)
        {
            // Update current job history with new online user
            let stCurrentQAJobId = lstUserInprogressJob.GetAt(0).job_id;
            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (CANCEL Current QA job)
            Log("DEBUG");
            Log(stCurrentUser);
            Log(stCurrentQAJobId);
            Log("CANCEL Current QA job / status -> UNCHECKED");

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
    }

    if(bCancelDelayCurrentQAJob)
    {
        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stLoggedUserId},["job_id"]);
        if(lstUserInprogressJob.Count() != 0)
        {
            // Update current job history with new online user
            let stCurrentQAJobId = lstUserInprogressJob.GetAt(0).job_id;
            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (DELAY Current QA job)
            Log("DEBUG");
            Log(stCurrentUser);
            Log(stCurrentQAJobId);
            Log("DELAY Current QA job / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentQAJobId
            },{
                status : "UNCHECKED",
                current_user: null,
                delay_time: dtl.Now().DtlAddHours(int.Parse(stDelayTime)).DtlToDtdb()
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
        }
    }
}