//# server program ai_scan_coordinator_dashboard for form ai_scan_coordinator_dashboard
//# using reftab ai_scan_user_language;

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
                    }
                }
            }
        }
    }
}