//# server typescript program ai_scan_output for form ai_scan_output
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_delivery_note;
//# using dacs DeliveryNoteOperation;

{
    //Find submit buttons in Redo popup and Delete popup
    let sbRedo = null;
    for(let recRP of form.puRedoPopup.tblRedoTable.rows)
    {
        sbRedo = recRP.cmbbtnSubmitRedoPopupButton;
    }

    let sbDelete = null;
    for(let recDP of form.puDeletePopup.tblDeleteTable.rows)
    {
        sbDelete = recDP.cmbbtnSubmitDeletePopupButton;
    }

    //Yes button clicked in Redo popup
    if(sbRedo !== null)
    {
        if(sbRedo.submitter)
        {
            let lstDeliveryNotesId = list.New();
            lstDeliveryNotesId = form.stDeliveryNotes.SplitOnMany([","],false);
            let iCount = lstDeliveryNotesId.Count();
            for(let i = 0; i < iCount; i = i + 1)
            {
                Log(lstDeliveryNotesId.GetAt(i));
                
                ////delete previous result
                //db.ai_scan_delivery_note.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_qa_job_result.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_job_result.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_jobs.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});

                //Send redo operation to BAUAPP and DM for redo delivery note in BAUAPP    
                let dacs = messages.DeliveryNoteOperation.New();
                dacs.OperationTask.scanId = lstDeliveryNotesId.GetAt(i);
                dacs.OperationTask.operation = "redo";
                dacs.Send();
            }
        }
    }

    //Yes button clicked in Delete popup
    if(sbDelete !== null)
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
                //db.ai_scan_delivery_note.DeleteMany({delivery_note_id : lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_job_result.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_qa_job_result.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_jobs_history.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_delivery_note_item_job.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_delivery_note_job.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});
                //db.ai_scan_jobs.DeleteMany({delivery_note_id: lstDeliveryNotesId.GetAt(i)});

                //Send delete operation to BAUAPP for delete delivery note in BAUAPP    
                let dacs = messages.DeliveryNoteOperation.New();
                dacs.OperationTask.scanId = lstDeliveryNotesId.GetAt(i);
                dacs.OperationTask.operation = "delete";
                dacs.Send();
            }
        }
    }
}