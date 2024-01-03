//# server typescript program ai_scan_NewQATask for dacs NewQATask
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_settings;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_delivery_note;
//# using reftab ai_scan_company;
//# using reftab ai_scan_project;
//# using dacs AssignAITask;

{
    Log(dacs);

    //If delivery note is redo
    let stRedoDeliveryNote = dacs.qaTask.redo;

    if(stRedoDeliveryNote === null || stRedoDeliveryNote === "")
    {
        let stOldDeliveryNoteId = dacs.qaTask.old_delivery_note_id;

        //If there is bad photo delivery and we retake in BAUAPP
        if(stOldDeliveryNoteId !== null && stOldDeliveryNoteId !== "")
        {
            Log("badphoto retake operation");
            db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_jobs.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        }

        // Create 2 anot job guid
        let stJobId = dacs.qaTask.requestFileId1;
        let stJobId2 = dacs.qaTask.requestFileId2;

        let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;

        if(stDefaultAIUser === "" || stDefaultAIUser === null)
        {
            Log("No Default AI User in ai_scan_settings table!");
            stDefaultAIUser = "";
        }

        // Get supplier id if exist
        let stSupplierID = null;
        if(dacs.qaTask.supplierId !== null || dacs.qaTask.supplierId !== "")
        {
            stSupplierID = dacs.qaTask.supplierId;
        }

        // Create Delivery Note row in ai_scan_delivery_note reftab
        db.ai_scan_delivery_note.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            supplier_id: stSupplierID,
            guidLcomp: dacs.qaTask.guidLcomp,
            guidLproj: dacs.qaTask.guidLproj,
            lang: dacs.qaTask.lang
        });

        // If guidLcomp not exist in ai_scan_company reftab or guidLcomp exist in ai_scan_company reftab but dacs company name different
        let stLcomp = db.ai_scan_company.ReadFields({id: dacs.qaTask.guidLcomp},["id","name"]).SingleOrDefault();
        if(stLcomp === null)
        {
            Log("guidLcomp not exist in ai_scan_company reftab");
            db.ai_scan_company.Insert({
                id: dacs.qaTask.guidLcomp,
                name: dacs.qaTask.nameLcomp
            });
        }
        else
        {
            let stLcompId = stLcomp.id;
            let stLcompName = stLcomp.name;
            if(stLcompId === dacs.qaTask.guidLcomp && stLcompName !== dacs.qaTask.nameLcomp)
            {
                Log("guidLcomp exist in ai_scan_company reftab but dacs company name different");
                db.ai_scan_company.UpdateMany({
                    id: stLcompId
                },{
                    name: dacs.qaTask.nameLcomp
                });
            }
        }

        // If guidLproj not exist in ai_scan_project reftab or guidLproj exist in ai_scan_project reftab but dacs project name different
        let stLproj = db.ai_scan_project.ReadFields({id: dacs.qaTask.guidLproj},["id","name"]).SingleOrDefault();
        if(stLproj === null)
        {
            Log("guidLproj not exist in ai_scan_project reftab");
            db.ai_scan_project.Insert({
                id: dacs.qaTask.guidLproj,
                name: dacs.qaTask.nameLproj
            });
        }
        else
        {
            let stLprojId = stLproj.id;
            let stLprojName = stLproj.name;
            if(stLprojId === dacs.qaTask.guidLproj && stLprojName !== dacs.qaTask.nameLproj)
            {
                Log("guidLproj exist in ai_scan_project reftab but dacs project name different");
                db.ai_scan_project.UpdateMany({
                    id: stLprojId
                },{
                    name: dacs.qaTask.nameLproj
                });
            }
        }

        //DEBUG Log (not redo ANOT Job1 created)
        Log("DEBUG");
        Log(stJobId);
        Log("not redo ANOT Job1 created  / status -> UNCHECKED");

        // Creat first job
        db.ai_scan_jobs.Insert({
            id: stJobId,
            type: "ANOT",
            status: "UNCHECKED",
            supplier_id: stSupplierID,
            lang: dacs.qaTask.lang,
            current_user: null,
            delivery_note_id: dacs.qaTask.scanId,
            delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId2,
            job_id_3: null,
            job_url: dacs.qaTask.aiUrl1,
            assigned: 0,
            redo_delivery_note: "NO"
        });

        // Creat first job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId,
            users: null
        });

        // Create delivery_note for first job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            job_id: stJobId,
			job_type: "ANOT",
            status: "waiting",
            avg_score_must_have: 0.0,
            avg_score_overall: 0.0,
            fileref_pdf: dacs.qaTask.mediaIdPdf === null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
        });

        //Add default user from ANNOT first job on AI page    
        let dacs2 = messages.AssignAITask.New();
        dacs2.assignTask.scanId = dacs.qaTask.scanId;
        dacs2.assignTask.requestFileId = stJobId;
        dacs2.assignTask.agent = stDefaultAIUser;
        //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs2.Send();

        //DEBUG Log (not redo ANOT Job2 created)
        Log("DEBUG");
        Log(stJobId2);
        Log("not redo ANOT Job2 created  / status -> UNCHECKED");

        // Creat second job
        db.ai_scan_jobs.Insert({
            id: stJobId2,
            type: "ANOT",
            status: "UNCHECKED",
            supplier_id: stSupplierID,
            lang: dacs.qaTask.lang,
            current_user: null,
            delivery_note_id: dacs.qaTask.scanId,
            delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId,
            job_id_3: null,
            job_url: dacs.qaTask.aiUrl2,
            assigned: 0,
            redo_delivery_note: "NO"
        });

        // Create second job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId2,
            users: null
        });

        // Create delivery_note for second job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            job_id: stJobId2,
			job_type: "ANOT",
            status: "waiting",
            avg_score_must_have: 0.0,
            avg_score_overall: 0.0,
            fileref_pdf: dacs.qaTask.mediaIdPdf === null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
        });

        //Add default user from ANNOT second job on AI page
        
        let dacs3 = messages.AssignAITask.New();
        dacs3.assignTask.scanId = dacs.qaTask.scanId;
        dacs3.assignTask.requestFileId = stJobId2;
        dacs3.assignTask.agent = stDefaultAIUser;
        //dacs3.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs3.Send();
    }
    else
    {

        let stOldDeliveryNoteId = dacs.qaTask.old_delivery_note_id;

        //If there is bad photo delivery and we retake in BAUAPP
        if(stOldDeliveryNoteId !== null && stOldDeliveryNoteId !== "")
        {
            Log("badphoto retake operation");
            db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_jobs.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
            db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        }

        // Create 2 anot job guid
        let stJobId = dacs.qaTask.requestFileId1;
        let stJobId2 = dacs.qaTask.requestFileId2;

        let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;

        if(stDefaultAIUser === "" || stDefaultAIUser === null)
        {
            Log("No Default AI User in ai_scan_settings table!");
            stDefaultAIUser = "";
        }

        // Get supplier id if exist
        let stSupplierID = null;
        if(dacs.qaTask.supplierId !== null || dacs.qaTask.supplierId !== "")
        {
            stSupplierID = dacs.qaTask.supplierId;
        }

        // Create Delivery Note row in ai_scan_delivery_note reftab
        db.ai_scan_delivery_note.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            supplier_id: stSupplierID,
            guidLcomp: dacs.qaTask.guidLcomp,
            guidLproj: dacs.qaTask.guidLproj,
            lang: dacs.qaTask.lang
        });

        // If guidLcomp not exist in ai_scan_company reftab or guidLcomp exist in ai_scan_company reftab but dacs company name different
        let stLcomp = db.ai_scan_company.ReadFields({id: dacs.qaTask.guidLcomp},["id","name"]).SingleOrDefault();
        if(stLcomp === null)
        {
            Log("guidLcomp not exist in ai_scan_company reftab");
            db.ai_scan_company.Insert({
                id: dacs.qaTask.guidLcomp,
                name: dacs.qaTask.nameLcomp
            });
        }
        else
        {
            let stLcompId = stLcomp.id;
            let stLcompName = stLcomp.name;
            if(stLcompId === dacs.qaTask.guidLcomp && stLcompName !== dacs.qaTask.nameLcomp)
            {
                Log("guidLcomp exist in ai_scan_company reftab but dacs company name different");
                db.ai_scan_company.UpdateMany({
                    id: stLcompId
                },{
                    name: dacs.qaTask.nameLcomp
                });
            }
        }

        // If guidLproj not exist in ai_scan_project reftab or guidLproj exist in ai_scan_project reftab but dacs project name different
        let stLproj = db.ai_scan_project.ReadFields({id: dacs.qaTask.guidLproj},["id","name"]).SingleOrDefault();
        if(stLproj === null)
        {
            Log("guidLproj not exist in ai_scan_project reftab");
            db.ai_scan_project.Insert({
                id: dacs.qaTask.guidLproj,
                name: dacs.qaTask.nameLproj
            });
        }
        else
        {
            let stLprojId = stLproj.id;
            let stLprojName = stLproj.name;
            if(stLprojId === dacs.qaTask.guidLproj && stLprojName !== dacs.qaTask.nameLproj)
            {
                Log("guidLproj exist in ai_scan_project reftab but dacs project name different");
                db.ai_scan_project.UpdateMany({
                    id: stLprojId
                },{
                    name: dacs.qaTask.nameLproj
                });
            }
        }

        //DEBUG Log (redo ANOT Job created)
        Log("DEBUG");
        Log(stJobId);
        Log("redo ANOT Job created  / status -> UNCHECKED");

        // Creat first job
        db.ai_scan_jobs.Insert({
            id: stJobId,
            type: "ANOT",
            status: "UNCHECKED",
            supplier_id: stSupplierID,
            lang: dacs.qaTask.lang,
            current_user: null,
            delivery_note_id: dacs.qaTask.scanId,
            delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId2,
            job_id_3: null,
            job_url: dacs.qaTask.aiUrl1,
            assigned: 0,
            redo_delivery_note: "YES"
        });

        // Creat first job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId,
            users: null
        });

        // Create delivery_note for first job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            job_id: stJobId,
			job_type: "ANOT",
            status: "waiting",
            avg_score_must_have: 0.0,
            avg_score_overall: 0.0,
            fileref_pdf: dacs.qaTask.mediaIdPdf === null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
        });

        //Add default user from ANNOT first job on AI page    
        let dacs2 = messages.AssignAITask.New();
        dacs2.assignTask.scanId = dacs.qaTask.scanId;
        dacs2.assignTask.requestFileId = stJobId;
        dacs2.assignTask.agent = stDefaultAIUser;
        //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs2.Send();

        //DEBUG Log (redo ANOT Job2 created)
        Log("DEBUG");
        Log(stJobId2);
        Log("redo ANOT Job2 created  / status -> UNCHECKED");

        // Creat second job
        db.ai_scan_jobs.Insert({
            id: stJobId2,
            type: "ANOT",
            status: "UNCHECKED",
            supplier_id: stSupplierID,
            lang: dacs.qaTask.lang,
            current_user: null,
            delivery_note_id: dacs.qaTask.scanId,
            delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId,
            job_id_3: null,
            job_url: dacs.qaTask.aiUrl2,
            assigned: 0,
            redo_delivery_note: "YES"
        });

        // Create second job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId2,
            users: null
        });

        // Create delivery_note for second job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: dacs.qaTask.scanId,
            job_id: stJobId2,
			job_type: "ANOT",
            status: "waiting",
            avg_score_must_have: 0.0,
            avg_score_overall: 0.0,
            fileref_pdf: dacs.qaTask.mediaIdPdf === null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
        });

        //Add default user from ANNOT second job on AI page
        
        let dacs3 = messages.AssignAITask.New();
        dacs3.assignTask.scanId = dacs.qaTask.scanId;
        dacs3.assignTask.requestFileId = stJobId2;
        dacs3.assignTask.agent = stDefaultAIUser;
        //dacs3.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs3.Send();
    }
}