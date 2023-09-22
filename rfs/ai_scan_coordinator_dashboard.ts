//# server program ai_scan_coordinator_dashboard for form ai_scan_coordinator_dashboard
//# using reftab ai_scan_user_language;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_jobs_history;

{
    let sbSave = form.sbtnSave;

    if(sbSave.submitter)
    {
        for(let recData of form.tblStats.rows)
        {
            for(let recData2 of recData.tblTeamANOT.rows)
            {
                let stUserId = recData2.stUserId;

                let bHUNANOTJobAccess = recData2.bHUNANOTJobAccess;
                let bENGANOTJobAccess = recData2.bENGANOTJobAccess;
                let bPLANOTJobAccess = recData2.bPLANOTJobAccess;

                if(bHUNANOTJobAccess == true)
                {
                    let lstUserHUNLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "hu_hu",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserHUNLanguageAnot.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "hu_hu",
                            job_type: "ANOT"
                        });
                    }
                }
                if(bHUNANOTJobAccess == false)
                {
                    let lstUserHUNLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "hu_hu",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserHUNLanguageAnot.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "hu_hu",
                            job_type: "ANOT"
                        });

                        //If user has inprogress ANOT job and inprogress job language is hun then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "ANOT", lang: "hu_hu"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }

                if(bENGANOTJobAccess == true)
                {
                    let lstUserENGLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "eng_eng",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserENGLanguageAnot.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "eng_eng",
                            job_type: "ANOT"
                        });
                    }
                }
                if(bENGANOTJobAccess == false)
                {
                    let lstUserENGLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "eng_eng",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserENGLanguageAnot.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "eng_eng",
                            job_type: "ANOT"
                        });

                        //If user has inprogress ANOT job and inprogress job language is eng then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "ANOT", lang: "eng_eng"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }

                if(bPLANOTJobAccess == true)
                {
                    let lstUserPLLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "pl_pl",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserPLLanguageAnot.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "pl_pl",
                            job_type: "ANOT"
                        });
                    }
                }
                if(bPLANOTJobAccess == false)
                {
                    let lstUserPLLanguageAnot = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "pl_pl",job_type: "ANOT"},["lang"]);

                    let iCount = lstUserPLLanguageAnot.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "pl_pl",
                            job_type: "ANOT"
                        });

                        //If user has inprogress ANOT job and inprogress job language is pl then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "ANOT", lang: "pl_pl"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }
            }

            for(let recData2 of recData.tblTeamQA.rows)
            {
                let stUserId = recData2.stUserId;

                let bHUNQAJobAccess = recData2.bHUNQAJobAccess;
                let bENGQAJobAccess = recData2.bENGQAJobAccess;
                let bPLQAJobAccess = recData2.bPLQAJobAccess;

                if(bHUNQAJobAccess == true)
                {
                    let lstUserHUNLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "hu_hu",job_type: "QA"},["lang"]);

                    let iCount = lstUserHUNLanguageQA.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "hu_hu",
                            job_type: "QA"
                        });
                    }
                }
                if(bHUNQAJobAccess == false)
                {
                    let lstUserHUNLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "hu_hu",job_type: "QA"},["lang"]);

                    let iCount = lstUserHUNLanguageQA.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "hu_hu",
                            job_type: "QA"
                        });

                        //If user has inprogress QA job and inprogress job language is hun then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "QA", lang: "hu_hu"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }

                if(bENGQAJobAccess == true)
                {
                    let lstUserENGLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "eng_eng",job_type: "QA"},["lang"]);

                    let iCount = lstUserENGLanguageQA.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "eng_eng",
                            job_type: "QA"
                        });
                    }
                }
                if(bENGQAJobAccess == false)
                {
                    let lstUserENGLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "eng_eng",job_type: "QA"},["lang"]);

                    let iCount = lstUserENGLanguageQA.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "eng_eng",
                            job_type: "QA"
                        });

                        //If user has inprogress QA job and inprogress job language is eng then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "QA", lang: "eng_eng"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }

                if(bPLQAJobAccess == true)
                {
                    let lstUserPLLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "pl_pl",job_type: "QA"},["lang"]);

                    let iCount = lstUserPLLanguageQA.Count();

                    if(iCount == 0)
                    {
                        db.ai_scan_user_language.Insert({
                            user_id: stUserId,
                            lang: "pl_pl",
                            job_type: "QA"
                        });
                    }
                }
                if(bPLQAJobAccess == false)
                {
                    let lstUserPLLanguageQA = db.ai_scan_user_language.ReadFields({user_id: stUserId, lang: "pl_pl",job_type: "QA"},["lang"]);

                    let iCount = lstUserPLLanguageQA.Count();

                    if(iCount == 1)
                    {
                        db.ai_scan_user_language.DeleteMany({
                            user_id: stUserId,
                            lang: "pl_pl",
                            job_type: "QA"
                        });

                        //If user has inprogress QA job and inprogress job language is pl then cancel the inprogress job
                        let lstUserInprogressJob = db.ai_scan_job_inprogress.ReadFields({user_id: stUserId},["job_id"]);
                        if(lstUserInprogressJob.Count() != 0)
                        {
                            let stJobId = lstUserInprogressJob.GetAt(0).job_id;
                            let lstUserInprogressJobLang = db.ai_scan_jobs.ReadFields({id: stJobId, type: "QA", lang: "pl_pl"},["id"]);
                            if(lstUserInprogressJobLang.Count() != 0)
                            {
                                // Update current job history with new online user
                                let stCurrentJobId = stJobId;
                                let stCurrentUser = stUserId;

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
                            }
                        }
                    }
                }
            }
        }
    }
}