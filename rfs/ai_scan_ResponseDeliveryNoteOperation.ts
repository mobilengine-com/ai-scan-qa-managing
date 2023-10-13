//# server program ai_scan_ResponseDeliveryNoteOperation for dacs ResponseDeliveryNoteOperationToDM

{
    Log(dacs);

    // Create 2 anot job guid
    let stJobId = dacs.redoDeliveryNoteTask.requestFileId1;
    let stJobId2 = dacs.redoDeliveryNoteTask.requestFileId2;

    let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;

    if(stDefaultAIUser == "" || stDefaultAIUser == null)
    {
        Log("No Default AI User in ai_scan_settings table!");
        stDefaultAIUser = "";
    }

    //Delete previous result everywhere expected ai_scan_jobs ANOT jobs, ai_scan_delivery_note_job and ai_scan_jobs_history
    db.ai_scan_job_result.DeleteMany({delivery_note_id: dacs.redoDeliveryNoteTask.scanId});
    db.ai_scan_qa_job_result.DeleteMany({delivery_note_id: dacs.redoDeliveryNoteTask.scanId});
    db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id: dacs.redoDeliveryNoteTask.scanId});
    
    let stQAJobId = db.ai_scan_jobs.ReadFields({delivery_note_id: dacs.redoDeliveryNoteTask.scanId, type: "QA"},["id"]).SingleOrDefault().id;
    if(lstQAjob == "" || lstQAjob == null)
    {
        db.ai_scan_jobs_history.DeleteMany({id: stQAJobId});
        db.ai_scan_jobs.DeleteMany({id: stQAJobId});
    }

    //Update ai_scan_jobs and ai_scan_delivery_note_job reftables
    // First ANOT job
    db.ai_scan_delivery_note_job.UpdateMany({
        delivery_note_id: dacs.redoDeliveryNoteTask.scanId,
        job_id: stJobId
    },{
        status: "waiting",
        avg_score_must_have: 0.0,
        avg_score_overall: 0.0,
        customer_address: null,
        customer_name: null,
        delivery_address: null,
        delivery_recipient_name: null,
        issue_date: null,
        dtl_issue_date: null,
        order_number: null,
        supplier_address: null,
        supplier_name: null,
        supplier_tax_number: null,
        supplier_warehouse: null,
        supplier_id: null,
        weight_gross: null
    });

    db.ai_scan_jobs.UpdateMany({
        id: stJobId,
        delivery_note_id: dacs.redoDeliveryNoteTask.scanId
    },{
        status: "UNCHECKED",
        current_user: null,
        create_date: dtl.Now().DtlToDtdb(),
        delay_time: null,
        job_id_2: stJobId2,
        job_id_3: null,
        job_url: dacs.redoDeliveryNoteTask.aiUrl1,
        assigned: 0,
        redo_delivery_note: "YES"
    });

    //Add default user from ANNOT first job on AI page    
    let dacs2 = messages.AssignAITask.New();
    dacs2.assignTask.scanId = dacs.redoDeliveryNoteTask.scanId;
    dacs2.assignTask.requestFileId = stJobId;
    dacs2.assignTask.agent = stDefaultAIUser;
    //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
    dacs2.Send();

    // Second ANOT job
    db.ai_scan_delivery_note_job.UpdateMany({
        delivery_note_id: dacs.redoDeliveryNoteTask.scanId,
        job_id: stJobId2
    },{
        status: "waiting",
        avg_score_must_have: 0.0,
        avg_score_overall: 0.0,
        customer_address: null,
        customer_name: null,
        delivery_address: null,
        delivery_recipient_name: null,
        issue_date: null,
        dtl_issue_date: null,
        order_number: null,
        supplier_address: null,
        supplier_name: null,
        supplier_tax_number: null,
        supplier_warehouse: null,
        supplier_id: null,
        weight_gross: null
    });

    db.ai_scan_jobs.UpdateMany({
        id: stJobId2,
        delivery_note_id: dacs.redoDeliveryNoteTask.scanId
    },{
        status: "UNCHECKED",
        current_user: null,
        create_date: dtl.Now().DtlToDtdb(),
        delay_time: null,
        job_id_2: stJobId,
        job_id_3: null,
        job_url: dacs.redoDeliveryNoteTask.aiUrl2,
        assigned: 0,
        redo_delivery_note: "YES"
    });

    //Add default user from ANNOT first job on AI page    
    let dacs3 = messages.AssignAITask.New();
    dacs3.assignTask.scanId = dacs.redoDeliveryNoteTask.scanId;
    dacs3.assignTask.requestFileId = stJobId2;
    dacs3.assignTask.agent = stDefaultAIUser;
    //dacs3.assignTask.agent = "botond.bakai@mobilengine.com";
    dacs3.Send();
}