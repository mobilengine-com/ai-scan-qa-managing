//# server program ai_scan_NewQATask for dacs NewQATask
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_settings;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_delivery_note_item_job;
//# using dacs AssignAITask;

{
    Log(dacs);

    let stOldDeliveryNoteId = dacs.qaTask.old_delivery_note_id;

    //If there is bad photo delivery and we retake in BAUAPP
    if(stOldDeliveryNoteId != null && stOldDeliveryNoteId != "")
    {
        db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        db.ai_scan_job_result.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        db.ai_scan_jobs.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
        db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : stOldDeliveryNoteId});
    }

    // Create 2 anot job guid
    let stJobId = dacs.qaTask.requestFileId1;
    let stJobId2 = dacs.qaTask.requestFileId2;

    let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;

    if(stDefaultAIUser == "" || stDefaultAIUser == null)
    {
        Log("No Default AI User in ai_scan_settings table!");
        stDefaultAIUser = "";
    }

    // Get supplier id if exist
    let stSupplierID = null;
    if(dacs.qaTask.supplierId != null || dacs.qaTask.supplierId != "")
    {
        stSupplierID = dacs.qaTask.supplierId;
    }

    //
    // TODO: look up dacs.qaTask.guidLcomp in new reftab, add if not exits, update if name is changed
    // TODO: look up dacs.qaTask.guidLproj in new reftab, add if not exits, update if name is changed
    // 

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
        assigned: 0
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
        status: "waiting",
        avg_score_must_have: 0.0,
        avg_score_overall: 0.0,
        fileref_pdf: dacs.qaTask.mediaIdPdf == null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
    });

    //Add default user from ANNOT first job on AI page    
    let dacs2 = messages.AssignAITask.New();
    dacs2.assignTask.scanId = dacs.qaTask.scanId;
    dacs2.assignTask.requestFileId = stJobId;
    dacs2.assignTask.agent = stDefaultAIUser;
    //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
    dacs2.Send();

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
        assigned: 0
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
        status: "waiting",
        avg_score_must_have: 0.0,
        avg_score_overall: 0.0,
        fileref_pdf: dacs.qaTask.mediaIdPdf == null ? null : fileref.New(dacs.qaTask.mediaIdPdf, 0)
    });

    //Add default user from ANNOT second job on AI page
    
    let dacs3 = messages.AssignAITask.New();
    dacs3.assignTask.scanId = dacs.qaTask.scanId;
    dacs3.assignTask.requestFileId = stJobId2;
    dacs3.assignTask.agent = stDefaultAIUser;
    //dacs3.assignTask.agent = "botond.bakai@mobilengine.com";
    dacs3.Send();
}