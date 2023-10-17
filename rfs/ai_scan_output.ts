//# server program ai_scan_output for form ai_scan_output
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_job_result;
//# using dacs SendRedoOperationToDM;
//# using dacs DeliveryNoteOperation;

{
    //Find submit buttons in Redo popup and Delete popup
    let sbRedo = null;
    for(let recRP in form.puRedoPopup.tblRedoTable.rows)
    {
        sbRedo = recRP.cmbbtnSubmitRedoPopupButton;
    }

    let sbDelete = null;
    for(let recDP in form.puDeletePopup.tblDeleteTable.rows)
    {
        sbDelete = recDP.cmbbtnSubmitDeletePopupButton;
    }

    //Yes button clicked in Redo popup
    if(sbRedo != null)
    {
        if(sbRedo.submitter)
        {
            let lstDeliveryNotesId = list.New();
            lstDeliveryNotesId = form.stDeliveryNotes.SplitOnMany([","],false);
            let iCount = lstDeliveryNotesId.Count();
            for(let i = 0; i < iCount; i = i + 1)
            {
                Log(lstDeliveryNotesId.GetAt(i));
                //Send redo operation to DM for redo delivery note in DM 
                let lstDeliveryNotes = db.ai_scan_jobs.Read({delivery_note_id: lstDeliveryNotesId.GetAt(i), type: "ANOT"});
                let stAnotJob1 = lstDeliveryNotes.GetAt(0).id;
                let stAnotJob2 = lstDeliveryNotes.GetAt(1).id;
                let dacs = messages.SendRedoOperationToDM.New();
                dacs.OperationTask.scanId = lstDeliveryNotesId.GetAt(i);
                dacs.OperationTask.operation = "redo";
                dacs.OperationTask.requestFileId1 = stAnotJob1;
                dacs.OperationTask.requestFileId2 = stAnotJob2;
                dacs.Send();

                //Send redo operation to BAUAPP for redo delivery note in BAUAPP    
                let dacs2 = messages.DeliveryNoteOperation.New();
                dacs2.OperationTask.scanId = lstDeliveryNotesId.GetAt(i);
                dacs2.OperationTask.operation = "redo";
                dacs2.Send();
            }
        }
    }

    //Yes button clicked in Delete popup
    if(sbDelete != null)
    {
        if(sbDelete.submitter)
        {
            let lstDeliveryNotesId = list.New();
            lstDeliveryNotesId = form.stDeliveryNotes.SplitOnMany([","],false);
            let iCount = lstDeliveryNotesId.Count();
            for(let i = 0; i < iCount; i = i + 1)
            {
                Log(lstDeliveryNotesId.GetAt(i));
                //Delete delivery note everywhere in DM
                db.ai_scan_job_result.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                db.ai_scan_qa_job_result.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                db.ai_scan_jobs_history.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                db.ai_scan_jobs.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});

                //Send delete operation to BAUAPP for delete delivery note in BAUAPP    
                let dacs = messages.DeliveryNoteOperation.New();
                dacs.OperationTask.scanId = lstDeliveryNotesId.GetAt(i);
                dacs.OperationTask.operation = "delete";
                dacs.Send();
            }
        }
    }
}