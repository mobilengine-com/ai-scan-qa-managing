//# server program ai_scan_NewQATask for dacs NewQATask
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_delivery_note_job;

{
    Log(dacs);

    // Create 2 anot job guid
    let stJobId = dacs.qaTask.requestFileId1;
    let stJobId2 = dacs.qaTask.requestFileId2;

    // Creat first job
    db.ai_scan_jobs.Insert({
        id: stJobId,
        type: "ANOT",
        status: "UNCHECKED",
        supplier_id: dacs.qaTask.supplierId,
        lang: dacs.qaTask.lang,
        current_user: null,
        delivery_note_id: dacs.qaTask.scanId,
        delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
        create_date: dacs.qaTask.dtlCreated.DtlToDtdb(),
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

    // Creat second job
    db.ai_scan_jobs.Insert({
        id: stJobId2,
        type: "ANOT",
        status: "UNCHECKED",
        supplier_id: dacs.qaTask.supplierId,
        lang: dacs.qaTask.lang,
        current_user: null,
        delivery_note_id: dacs.qaTask.scanId,
        delivery_note_work_start_date : dacs.qaTask.dtlCreated.DtlToDtdb(),
        create_date: dacs.qaTask.dtlCreated.DtlToDtdb(),
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
}