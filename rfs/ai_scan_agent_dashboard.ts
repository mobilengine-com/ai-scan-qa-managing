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
        let iLoggedUserJobCount = form.iLoggedUserJobCount;

        let lstAllUnassignedJobs = db.ai_scan_jobs_history.ReadFields({current_user: {equal : [null,""]}},["id","current_user","users"]);

        if(lstAllUnassignedJobs.Count() == 0 && iLoggedUserJobCount == 0)
        {
            Log("Logged user no job and no unassigned job availabel");
        }
        else if(lstAllUnassignedJobs.Count() != 0 && iLoggedUserJobCount == 0)
        {
            let lstQAJob = list.New();
            let lstANOTJob = list.New();

            for(let recData of lstAllUnassignedJobs)
            {
                lstQAJob = db.ai_scan_jobs.ReadFields({id: recData.id, type: "QA", status: {equal : "UNCHECKED"}},["id","type","status"]).SingleOrDefault();

                if(lstQAJob != null)
                {
                    break;
                }
            }

            Log(lstQAJob);

            if(lstQAJob != null)
            {
                let lstCurrentJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: lstQAJob.id},["users"]);

                let stCurrentJobUserHistory = "";

                for(let recCJUH of lstCurrentJobUserHistory)
                {
                    if(recCJUH.users != "" && recCJUH.users != null)
                    {
                        stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                    }
                }

                stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                db.ai_scan_jobs_history.UpdateMany({
                    id: lstQAJob.id
                },{
                    current_user: stLoggedUserId,
                    users: stCurrentJobUserHistory
                });

                // Update the job in ai_scan_jobs table
                db.ai_scan_jobs.UpdateMany({
                    id : lstQAJob.id
                },{
                    status : "INPROGRESS"
                });

                // Insert OR Update the job in ai_scan_job_inprogress table
                db.ai_scan_job_inprogress.InsertOrUpdate({
                    job_id : lstQAJob.id
                },{
                    user_id : stLoggedUserId,
                    job_start_time : dtl.Now().DtlToDtdb()
                });
            }
            else
            {
                for(let recData2 of lstAllUnassignedJobs)
                {
                    lstANOTJob = db.ai_scan_jobs.ReadFields({id: recData2.id, type: "ANOT", status: {equal : "UNCHECKED"}},["id","type","status"]).SingleOrDefault();

                    if(lstANOTJob != null)
                    {
                        break;
                    }
                }

                Log(lstANOTJob);

                let lstCurrentJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: lstANOTJob.id},["users"]);

                let stCurrentJobUserHistory = "";

                for(let recCJUH of lstCurrentJobUserHistory)
                {
                    if(recCJUH.users != "" && recCJUH.users != null)
                    {
                        stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                    }
                }

                stCurrentJobUserHistory = stCurrentJobUserHistory + stLoggedUserId;

                db.ai_scan_jobs_history.UpdateMany({
                    id: lstANOTJob.id
                },{
                    current_user: stLoggedUserId,
                    users: stCurrentJobUserHistory
                });

                // Update the job in ai_scan_jobs table
                db.ai_scan_jobs.UpdateMany({
                    id : lstANOTJob.id
                },{
                    status : "INPROGRESS"
                });

                // Insert OR Update the job in ai_scan_job_inprogress table
                db.ai_scan_job_inprogress.InsertOrUpdate({
                    job_id : lstANOTJob.id
                },{
                    user_id : stLoggedUserId,
                    job_start_time : dtl.Now().DtlToDtdb()
                });
                
            }
        }
        else
        {
            let stSelectedJobId = form.stLoggedUserSelectedJobId;

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stSelectedJobId
            },{
                status : "INPROGRESS"
            });

            // Insert OR Update the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.InsertOrUpdate({
                job_id : stSelectedJobId
            },{
                user_id : stLoggedUserId,
                job_start_time : dtl.Now().DtlToDtdb()
            });
        }
    }

    if(bCancelCurrentAnotJob)
    {
        // Update current job history with new online user
        let stCurrentJobId = form.stLoggedUserSelectedJobId;
        let stCurrentDeliveryId = form.stLoggedUserSelectedJobDeliveryId;
        let stCurrentDeliveryNoteId = form.stLoggedUserSelectedJobDeliveryNoteId;
        let stCurrentUser = stLoggedUserId;
        let stCurrentDeliveryNoteOtherJob = "";
        let lstRandomUserOnline = "";
        let lstUserOnline = db.ai_scan_user.ReadFields({status: "ONLINE"},["id"]);

        if(lstUserOnline.Count() <= 1)
        {
            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentJobId
            },{
                current_user: ""
            });
        }
        if(lstUserOnline.Count() == 2)
        {
            let lstCurrentJobDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId},["job_id"]);

            for(let recCJDNJ of lstCurrentJobDeliveryNoteJobs)
            {
                if(recCJDNJ.job_id != stCurrentJobId)
                {
                    stCurrentDeliveryNoteOtherJob = recCJDNJ.job_id;
                }
            }

            let stCurrentDeliveryNoteOtherJobUser = "";

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: stCurrentDeliveryNoteOtherJob},["current_user"]))
            {
                stCurrentDeliveryNoteOtherJobUser = recCDNOJU.current_user;
            }

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            if(lstRandomUserOnline.id != stCurrentUser && lstRandomUserOnline.id != stCurrentDeliveryNoteOtherJobUser)
            {
                let lstCurrentJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentJobId},["users"]);

                let stCurrentJobUserHistory = "";

                for(let recCJUH of lstCurrentJobUserHistory)
                {
                    stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
                }

                stCurrentJobUserHistory = stCurrentJobUserHistory + lstRandomUserOnline.id;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentJobId
                },{
                    current_user: lstRandomUserOnline.id,
                    users: stCurrentJobUserHistory
                });
            }
            else
            {
                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentJobId
                },{
                    current_user: ""
                });
            }
        }
        else
        {
            let lstCurrentJobDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId},["job_id"]);

            for(let recCJDNJ of lstCurrentJobDeliveryNoteJobs)
            {
                if(recCJDNJ.job_id != stCurrentJobId)
                {
                    stCurrentDeliveryNoteOtherJob = recCJDNJ.job_id;
                }
            }

            let stCurrentDeliveryNoteOtherJobUser = "";

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: stCurrentDeliveryNoteOtherJob},["current_user"]))
            {
                stCurrentDeliveryNoteOtherJobUser = recCDNOJU.current_user;
            }

            let lstCurrentJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentJobId},["users"]);

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            for(;lstRandomUserOnline.id == stCurrentUser || lstRandomUserOnline.id == stCurrentDeliveryNoteOtherJobUser;)
            {
                let iRandomNumber2 = (float.Random()*100000000).Floor()%lstUserOnline.Count();
                lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber2);
            }            

            let stCurrentJobUserHistory = "";

            for(let recCJUH of lstCurrentJobUserHistory)
            {
                stCurrentJobUserHistory = stCurrentJobUserHistory + recCJUH.users + ",";
            }

            stCurrentJobUserHistory = stCurrentJobUserHistory + lstRandomUserOnline.id;

            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentJobId
            },{
                current_user: lstRandomUserOnline.id,
                users: stCurrentJobUserHistory
            });
        }

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
        let stCurrentDeliveryId = form.stLoggedUserSelectedJobDeliveryId;
        let stCurrentDeliveryNoteId = form.stLoggedUserSelectedJobDeliveryNoteId;
        let stCurrentUser = stLoggedUserId;
        let lstRandomUserOnline = "";
        let lstUserOnline = db.ai_scan_user.ReadFields({status: "ONLINE"},["id"]);

        if(lstUserOnline.Count() == 0)
        {
            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentQAJobId
            },{
                current_user: ""
            });
        }
        else if(lstUserOnline.Count() == 1)
        {
            let stCurrentQAJobDeliveryNoteANOTUserOne = "";
            let stCurrentQAJobDeliveryNoteANOTUserTwo = "";

            let lstCurrentQAJobDeliveryNoteANOTJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId, job_id : {notEqual: stCurrentQAJobId}},["job_id"]);

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(0).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne == "" || stCurrentQAJobDeliveryNoteANOTUserOne == null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserOne = recCDNOJU.current_user;
                }
            }

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(1).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne != "" && stCurrentQAJobDeliveryNoteANOTUserOne != null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserTwo = recCDNOJU.current_user;
                }
            }

            let lstRandomUserOnline = "";

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            if(lstRandomUserOnline.id != stCurrentUser && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserOne && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserTwo)
            {
                let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                let stCurrentQAJobUserHistory = "";

                for(let recCJUH of lstCurrentQAJobUserHistory)
                {
                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                }

                stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + lstRandomUserOnline.id;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentQAJobId
                },{
                    current_user: lstRandomUserOnline.id,
                    users: stCurrentQAJobUserHistory
                });
            }
            else
            {
                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentQAJobId
                },{
                    current_user: ""
                });
            }

        }
        else if(lstUserOnline.Count() == 2)
        {
            let stCurrentQAJobDeliveryNoteANOTUserOne = "";
            let stCurrentQAJobDeliveryNoteANOTUserTwo = "";

            let lstCurrentQAJobDeliveryNoteANOTJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId, job_id : {notEqual: stCurrentQAJobId}},["job_id"]);

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(0).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne == "" || stCurrentQAJobDeliveryNoteANOTUserOne == null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserOne = recCDNOJU.current_user;
                }
            }

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(1).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne != "" && stCurrentQAJobDeliveryNoteANOTUserOne != null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserTwo = recCDNOJU.current_user;
                }
            }

            let lstRandomUserOnline = "";

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            if(lstRandomUserOnline.id != stCurrentUser && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserOne && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserTwo)
            {
                let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                let stCurrentQAJobUserHistory = "";

                for(let recCJUH of lstCurrentQAJobUserHistory)
                {
                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                }

                stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + lstRandomUserOnline.id;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentQAJobId
                },{
                    current_user: lstRandomUserOnline.id,
                    users: stCurrentQAJobUserHistory
                });
            }
            else
            {
                if(lstRandomUserOnline.id == stCurrentUser)
                {
                    if(stCurrentQAJobDeliveryNoteANOTUserOne != "")
                    {
                        let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                        let stCurrentQAJobUserHistory = "";

                        for(let recCJUH of lstCurrentQAJobUserHistory)
                        {
                            stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                        }

                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserOne;

                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: stCurrentQAJobDeliveryNoteANOTUserOne,
                            users: stCurrentQAJobUserHistory
                        });
                    }
                    else if(stCurrentQAJobDeliveryNoteANOTUserTwo != "")
                    {
                        let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                        let stCurrentQAJobUserHistory = "";

                        for(let recCJUH of lstCurrentQAJobUserHistory)
                        {
                            stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                        }

                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserTwo;

                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: stCurrentQAJobDeliveryNoteANOTUserTwo,
                            users: stCurrentQAJobUserHistory
                        });
                    }
                    else
                    {
                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: ""
                        });
                    }
                }
                else if(lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserOne)
                {
                    let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                    let stCurrentQAJobUserHistory = "";

                    for(let recCJUH of lstCurrentQAJobUserHistory)
                    {
                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                    }

                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserOne;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: stCurrentQAJobDeliveryNoteANOTUserOne,
                        users: stCurrentQAJobUserHistory
                    });
                }
                else if(lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserTwo)
                {
                    let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                    let stCurrentQAJobUserHistory = "";

                    for(let recCJUH of lstCurrentQAJobUserHistory)
                    {
                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                    }

                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserTwo;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: stCurrentQAJobDeliveryNoteANOTUserTwo,
                        users: stCurrentQAJobUserHistory
                    });
                }
                else
                {
                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: ""
                    });
                }
            }
        }
        else if(lstUserOnline.Count() == 3)
        {
            let stCurrentQAJobDeliveryNoteANOTUserOne = "";
            let stCurrentQAJobDeliveryNoteANOTUserTwo = "";

            let lstCurrentQAJobDeliveryNoteANOTJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId, job_id : {notEqual: stCurrentQAJobId}},["job_id"]);

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(0).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne == "" || stCurrentQAJobDeliveryNoteANOTUserOne == null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserOne = recCDNOJU.current_user;
                }
            }

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(1).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne != "" && stCurrentQAJobDeliveryNoteANOTUserOne != null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserTwo = recCDNOJU.current_user;
                }
            }

            let lstRandomUserOnline = "";

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            if(lstRandomUserOnline.id != stCurrentUser && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserOne && lstRandomUserOnline.id != stCurrentQAJobDeliveryNoteANOTUserTwo)
            {
                let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                let stCurrentQAJobUserHistory = "";

                for(let recCJUH of lstCurrentQAJobUserHistory)
                {
                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                }

                stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + lstRandomUserOnline.id;

                db.ai_scan_jobs_history.UpdateMany({
                    id: stCurrentQAJobId
                },{
                    current_user: lstRandomUserOnline.id,
                    users: stCurrentQAJobUserHistory
                });
            }
            else
            {
                if(lstRandomUserOnline.id == stCurrentUser)
                {
                    if(stCurrentQAJobDeliveryNoteANOTUserOne != "")
                    {
                        let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                        let stCurrentQAJobUserHistory = "";

                        for(let recCJUH of lstCurrentQAJobUserHistory)
                        {
                            stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                        }

                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserOne;

                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: stCurrentQAJobDeliveryNoteANOTUserOne,
                            users: stCurrentQAJobUserHistory
                        });
                    }
                    else if(stCurrentQAJobDeliveryNoteANOTUserTwo != "")
                    {
                        let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                        let stCurrentQAJobUserHistory = "";

                        for(let recCJUH of lstCurrentQAJobUserHistory)
                        {
                            stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                        }

                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserTwo;

                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: stCurrentQAJobDeliveryNoteANOTUserTwo,
                            users: stCurrentQAJobUserHistory
                        });
                    }
                    else
                    {
                        db.ai_scan_jobs_history.UpdateMany({
                            id: stCurrentQAJobId
                        },{
                            current_user: ""
                        });
                    }
                }
                else if(lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserOne)
                {
                    let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                    let stCurrentQAJobUserHistory = "";

                    for(let recCJUH of lstCurrentQAJobUserHistory)
                    {
                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                    }

                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserOne;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: stCurrentQAJobDeliveryNoteANOTUserOne,
                        users: stCurrentQAJobUserHistory
                    });
                }
                else if(lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserTwo)
                {
                    let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

                    let stCurrentQAJobUserHistory = "";

                    for(let recCJUH of lstCurrentQAJobUserHistory)
                    {
                        stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
                    }

                    stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + stCurrentQAJobDeliveryNoteANOTUserTwo;

                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: stCurrentQAJobDeliveryNoteANOTUserTwo,
                        users: stCurrentQAJobUserHistory
                    });
                }
                else
                {
                    db.ai_scan_jobs_history.UpdateMany({
                        id: stCurrentQAJobId
                    },{
                        current_user: ""
                    });
                }
            }
        }
        else
        {
            let stCurrentQAJobDeliveryNoteANOTUserOne = "";
            let stCurrentQAJobDeliveryNoteANOTUserTwo = "";

            let lstCurrentQAJobDeliveryNoteANOTJobs = db.ai_scan_delivery_note_job.ReadFields({id: stCurrentDeliveryId, delivery_note_id: stCurrentDeliveryNoteId, job_id : {notEqual: stCurrentQAJobId}},["job_id"]);

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(0).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne == "" || stCurrentQAJobDeliveryNoteANOTUserOne == null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserOne = recCDNOJU.current_user;
                }
            }

            for(let recCDNOJU of db.ai_scan_jobs_history.ReadFields({id: lstCurrentQAJobDeliveryNoteANOTJobs.GetAt(1).job_id},["current_user"]))
            {
                if(stCurrentQAJobDeliveryNoteANOTUserOne != "" && stCurrentQAJobDeliveryNoteANOTUserOne != null)
                {
                    stCurrentQAJobDeliveryNoteANOTUserTwo = recCDNOJU.current_user;
                }
            }

            let lstCurrentQAJobUserHistory = db.ai_scan_jobs_history.ReadFields({id: stCurrentQAJobId},["users"]);

            let iRandomNumber = (float.Random()*100000000).Floor()%lstUserOnline.Count();
            lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber);

            for(;lstRandomUserOnline.id == stCurrentUser || lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserOne || lstRandomUserOnline.id == stCurrentQAJobDeliveryNoteANOTUserTwo;)
            {
                let iRandomNumber2 = (float.Random()*100000000).Floor()%lstUserOnline.Count();
                lstRandomUserOnline = lstUserOnline.GetAt(iRandomNumber2);
            }            

            let stCurrentQAJobUserHistory = "";

            for(let recCJUH of lstCurrentQAJobUserHistory)
            {
                stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + recCJUH.users + ",";
            }

            stCurrentQAJobUserHistory = stCurrentQAJobUserHistory + lstRandomUserOnline.id;

            db.ai_scan_jobs_history.UpdateMany({
                id: stCurrentQAJobId
            },{
                current_user: lstRandomUserOnline.id,
                users: stCurrentQAJobUserHistory
            });
        }

        // Update the QA job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED"
        });

        // Delete the QA job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
    }
}