//# server typescript program ai_scan_DeliveryNoteOperationResult for dacs DeliveryNoteOperationResult
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_delivery_note;

{
	Log(dacs);
    let stDeliveryNoteId = dacs.OperationTaskResult.scanId;
	let stOperation = dacs.OperationTaskResult.operation;
	let stResult = dacs.OperationTaskResult.result;

	if(stOperation === "redo" && stResult === "success")
	{
		//delete previous result everywhere in DM
		db.ai_scan_delivery_note.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_job_result.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_jobs.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : stDeliveryNoteId});
		Log("Redo operation run successfully in BA company");
	}

	if(stOperation === "delete" && stResult === "success")
	{
		//Delete delivery note datas everywhere in DM
		db.ai_scan_delivery_note.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_job_result.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_jobs.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : stDeliveryNoteId});
		db.ai_scan_jobs_history.DeleteMany({delivery_note_id: stDeliveryNoteId});
		Log("Delete operation run successfully in BA company");
	}

	if(stResult === "retake")
	{
		Log("No operation because delivery note retaked in BA company");
	}

	if(stResult === "error")
	{
		Log("No operation because error in BA company");
	}
}