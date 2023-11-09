//# server program ai_scan_qa_job for form ai_scan_qa_job
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_user;
//# using reftab ai_scan_job_result;
//# using dacs QATaskDone;

{
    let stDelayTime = form.stDelayTime;

    if(stDelayTime == null || stDelayTime == "")
    {
        stDelayTime = "1";
    }

    let stSelectedQAJobSupplierANNOTJob1 = form.stSelectedQAJobSupplierANNOTJob1;
    let stSelectedQAJobSupplierANNOTJob2 = form.stSelectedQAJobSupplierANNOTJob2;

    let bBadPhoto = form.bBadPhoto;
    let bCancel = form.bCancel;
    let bDelayCancel = form.bDelayCancel;

    let sbHandwritten = form.sbtnHandwritten;
    let sbApproved = form.sbtnApprove;

    let stLoggedUserId = form.stLoggedUserId;
    let stSelectedQAJobId = form.stSelectedQAJobId;
    let stSelectedQAJobDeliveryNoteId = form.stSelectedQAJobAnotJobsAgentADeliveryNoteId;
    let stresult = "";
    let dtlSelectedQAJobDeliveryNoteWorkStartDate = form.dtlSelectedQAJobDeliveryNoteWorkStartDate;

    if((stLoggedUserId == null || stLoggedUserId == "") || (stSelectedQAJobDeliveryNoteId == null || stSelectedQAJobDeliveryNoteId == "") || (dtlSelectedQAJobDeliveryNoteWorkStartDate == null))
    {
        //hiba van és eldobjuk az aktuális usertől a feladatot
        Log("stLoggedUserId, stSelectedQAJobDeliveryNoteId and dtlSelectedQAJobDeliveryNoteWorkStartDate empty or null");
        Log("If empty or null one of the upper values then ERROR and current job cancel");
        
        // Update current job history with new online user
        let stCurrentQAJobId = stSelectedQAJobId;

        //DEBUG Log (stLoggedUserId, stSelectedQAJobDeliveryNoteId and dtlSelectedQAJobDeliveryNoteWorkStartDate empty or null)
        Log("DEBUG");
        Log(stCurrentQAJobId);
        Log("QA Job stLoggedUserId, stSelectedQAJobDeliveryNoteId and dtlSelectedQAJobDeliveryNoteWorkStartDate empty or null  / status -> UNCHECKED");

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED",
            current_user: null
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId});
    }

    if((stLoggedUserId != null && stLoggedUserId != "") && (stSelectedQAJobDeliveryNoteId != null && stSelectedQAJobDeliveryNoteId != "") && (dtlSelectedQAJobDeliveryNoteWorkStartDate != null))
    {
        if(bBadPhoto)
        {
            stresult = "Bad photo";
            //Send DACS
            let dacs = messages.QATaskDone.New();
            dacs.dnResponse.guid = stSelectedQAJobDeliveryNoteId;
            dacs.dnResponse.requestFileId = stSelectedQAJobId;
            dacs.dnResponse.avgscoreMustHave = 0.0;
            dacs.dnResponse.avgscoreOverall = 0.0;
            dacs.dnResponse.rejected = 1;

            dacs.Send();

            //QA job status update to handwritten
            //get current QA job's user
            let stCurrentJobUserId = "";
            let stCurrentJobUserName = "";
            let dtlCurrentJobStartTime = dtl.Now();

            let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stSelectedQAJobId},["user_id","job_start_time"]);

            for(let recData of lstCurrentJobUser)
            {
                let lstCurrentUser = db.ai_scan_user.ReadFields({id: recData.user_id},["name"]);

                for(let recUser of lstCurrentUser)
                {
                    stCurrentJobUserId = recData.user_id;
                    stCurrentJobUserName = recUser.name;
                    dtlCurrentJobStartTime = recData.job_start_time.DeclareAsDtl();
                }
            }

            //get job work time
            let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

            let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

            //create result 
            db.ai_scan_qa_job_result.InsertOrUpdate({
                job_id: stSelectedQAJobId
            },{
                delivery_note_id: stSelectedQAJobDeliveryNoteId,
                user_id: stCurrentJobUserId,
                user_name: stCurrentJobUserName,
                result: stresult,
                finish_date: dtl.Now().DtlToDtdb(),
                job_work_time_minutes: iJobWorkTime
            });

            //DEBUG Log (QA Job BAD PHOTO DONE)
            Log("DEBUG");
            Log(stSelectedQAJobId);
            Log("QA Job BAD PHOTO DONE  / status -> DONE");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stSelectedQAJobId
            },{
                status : "DONE",
                delivery_note_work_end_date: dtl.Now().DtlToDtdb(),
                delivery_note_work_time: dtl.Now().Diff(dtlSelectedQAJobDeliveryNoteWorkStartDate).TotalHours
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stSelectedQAJobId, user_id : stCurrentJobUserId});
        }

        if(sbHandwritten.submitter)
        {
            stresult = "Handwritten";

            let stSendAgentCustomerAddress = form.stSendAgentCustomerAddress;
            let stSendAgentCustomerName = form.stSendAgentCustomerName;
            let stSendAgentDeliveryAddress = form.stSendAgentDeliveryAddress;
            let stSendAgentDeliveryRecipientName = form.stSendAgentDeliveryRecipientName;
            let stSendAgentIssueDate = form.stSendAgentIssueDate;
            let stSendAgentOrderNumber = form.stSendAgentOrderNumber;
            let stSendAgentSupplierAddress = form.stSendAgentSupplierAddress;
            let stSendAgentSupplierName = form.stSendAgentSupplierName;
            let stSendAgentSupplierTaxNumber = form.stSendAgentSupplierTaxNumber;
            let stSendAgentSupplierWarehouse = form.stSendAgentSupplierWarehouse;
            let stSendAgentSupplierId = form.stSendAgentSupplierId;
            let stSendAgentWeightGross = form.stSendAgentWeightGross;

            let lstAgentAItemTableItemNameRowIdEdit = list.New();
            let lstAgentBItemTableItemNameRowIdEdit = list.New();
            let lstAgentAItemTableItemNameRowIdAccept = list.New();
            let lstAgentBItemTableItemNameRowIdAccept = list.New();
            let lstAgentAItemTableManufacturerItemNumberRowIdEdit = list.New();
            let lstAgentBItemTableManufacturerItemNumberRowIdEdit = list.New();
            let lstAgentAItemTableManufacturerItemNumberRowIdAccept = list.New();
            let lstAgentBItemTableManufacturerItemNumberRowIdAccept = list.New();
            let lstAgentAItemTableTaxNumberRowIdEdit = list.New();
            let lstAgentBItemTableTaxNumberRowIdEdit = list.New();
            let lstAgentAItemTableTaxNumberRowIdAccept = list.New();
            let lstAgentBItemTableTaxNumberRowIdAccept = list.New();
            let lstAgentAItemTableAmountRowIdEdit = list.New();
            let lstAgentBItemTableAmountRowIdEdit = list.New();
            let lstAgentAItemTableAmountRowIdAccept = list.New();
            let lstAgentBItemTableAmountRowIdAccept = list.New();
            let lstAgentAItemTableUnitRowIdEdit = list.New();
            let lstAgentBItemTableUnitRowIdEdit = list.New();
            let lstAgentAItemTableUnitRowIdAccept = list.New();
            let lstAgentBItemTableUnitRowIdAccept = list.New();
            let lstAgentAItemTableGrossWeightRowIdEdit = list.New();
            let lstAgentBItemTableGrossWeightRowIdEdit = list.New();
            let lstAgentAItemTableGrossWeightRowIdAccept = list.New();
            let lstAgentBItemTableGrossWeightRowIdAccept = list.New();

            let lstAgentAItemTableItemName = list.New();
            let lstAgentBItemTableItemName = list.New();
            let lstAgentAItemTableManufacturerItemNumber = list.New();
            let lstAgentBItemTableManufacturerItemNumber = list.New();
            let lstAgentAItemTableTaxNumber = list.New();
            let lstAgentBItemTableTaxNumber = list.New();
            let lstAgentAItemTableAmount = list.New();
            let lstAgentBItemTableAmount = list.New();
            let lstAgentAItemTableUnit = list.New();
            let lstAgentBItemTableUnit = list.New();
            let lstAgentAItemTableGrossWeight = list.New();
            let lstAgentBItemTableGrossWeight = list.New();
            
            let iCount = 0;

            let iSelectedQAJobAgentAResultItemTable = form.iSelectedQAJobAgentAResultItemTable;
            let iSelectedQAJobAgentBResultItemTable = form.iSelectedQAJobAgentBResultItemTable;

            let iRptItemTableAgentARowCount = form.iItemTableAgentARowCount;
            let iRptItemTableAgentBRowCount = form.iItemTableAgentBRowCount;

            if(iRptItemTableAgentARowCount == iRptItemTableAgentBRowCount)
            {
                iCount = iRptItemTableAgentARowCount;
            }
            else
            {
                if(iSelectedQAJobAgentAResultItemTable != 0 && iSelectedQAJobAgentBResultItemTable == 0)
                {
                    iCount = iSelectedQAJobAgentAResultItemTable;
                }
                else if(iSelectedQAJobAgentAResultItemTable == 0 && iSelectedQAJobAgentBResultItemTable != 0)
                {
                    iCount = iSelectedQAJobAgentBResultItemTable;
                }
                else
                {
                    iCount = 0;
                }
            }

            let lstFinalItemTable = list.New();

            if(iCount != 0)
            {
                for(let recData of form.rptItemTable.rows)
                {
                    lstAgentAItemTableItemNameRowIdEdit = recData.stEditItemAgentAItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemNameRowIdEdit = recData.stEditItemAgentBItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableItemNameRowIdAccept = recData.stAcceptItemAgentAItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemNameRowIdAccept = recData.stAcceptItemAgentBItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentAManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentBManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentAManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentBManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumberRowIdEdit = recData.stEditItemAgentATaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumberRowIdEdit = recData.stEditItemAgentBTaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentATaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentBTaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmountRowIdEdit = recData.stEditItemAgentAAmountRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmountRowIdEdit = recData.stEditItemAgentBAmountRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmountRowIdAccept = recData.stAcceptItemAgentAAmountRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmountRowIdAccept = recData.stAcceptItemAgentBAmountRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnitRowIdEdit = recData.stEditItemAgentAUnitRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnitRowIdEdit = recData.stEditItemAgentBUnitRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnitRowIdAccept = recData.stAcceptItemAgentAUnitRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnitRowIdAccept = recData.stAcceptItemAgentBUnitRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeightRowIdEdit = recData.stEditItemAgentAGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeightRowIdEdit = recData.stEditItemAgentBGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentAGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentBGrossWeightRowId.SplitOnMany(["|"],false);

                    lstAgentAItemTableItemName = recData.stItemTableAItemName.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemName = recData.stItemTableBItemName.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumber = recData.stItemTableAManufacturerItemNumber.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumber = recData.stItemTableBManufacturerItemNumber.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumber = recData.stItemTableATaxNumber.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumber = recData.stItemTableBTaxNumber.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmount = recData.stItemTableAAmount.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmount = recData.stItemTableBAmount.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnit = recData.stItemTableAUnit.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnit = recData.stItemTableBUnit.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeight = recData.stItemTableAGrossWeight.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeight = recData.stItemTableBGrossWeight.SplitOnMany(["|"],false);
                }
            }

            let bMainTableEditedTextAvaiable = form.bMainTableEditedTextAvaiable;
            let bMainTableOnlyAgentAAccepted = form.bMainTableOnlyAgentAAccepted;
            let bMainTableOnlyAgentBAccepted = form.bMainTableOnlyAgentBAccepted;

            let bItemTableEdittedVariable = false;
            let bItemTableAOnlyAccepted = false;
            let bItemTableBOnlyAccepted = false;

            for(let i = 0; i < iCount; i = i + 1)
            {
                //item row
                lstFinalItemTable.Add(i);

                //item name
                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentAItemTableItemNameRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableItemName.GetAt(i));
                }
                if(lstAgentBItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentBItemTableItemNameRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableItemName.GetAt(i));
                }
                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) == "" && lstAgentAItemTableItemNameRowIdAccept.GetAt(i) == "" && lstAgentBItemTableItemNameRowIdEdit.GetAt(i) == "" && lstAgentBItemTableItemNameRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableItemName.GetAt(i) != null && lstAgentAItemTableItemName.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableItemName.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableItemName.GetAt(i));
                    }
                }

                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentBItemTableItemNameRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableItemNameRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableItemNameRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //manufacturer item number
                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableManufacturerItemNumber.GetAt(i));
                }
                if(lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableManufacturerItemNumber.GetAt(i));
                }
                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableManufacturerItemNumber.GetAt(i) != null && lstAgentAItemTableManufacturerItemNumber.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableManufacturerItemNumber.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableManufacturerItemNumber.GetAt(i));
                    }
                }

                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //tax number
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableTaxNumber.GetAt(i));
                }
                if(lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableTaxNumber.GetAt(i));
                }
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableTaxNumber.GetAt(i) != null && lstAgentAItemTableTaxNumber.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableTaxNumber.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableTaxNumber.GetAt(i));
                    }
                }  
                
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //amount number
                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentAItemTableAmountRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableAmount.GetAt(i));
                }
                if(lstAgentBItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableAmount.GetAt(i));
                }
                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) == "" && lstAgentAItemTableAmountRowIdAccept.GetAt(i) == "" && lstAgentBItemTableAmountRowIdEdit.GetAt(i) == "" && lstAgentBItemTableAmountRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableAmount.GetAt(i) != null && lstAgentAItemTableAmount.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableAmount.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableAmount.GetAt(i));
                    }
                }

                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableAmountRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableAmountRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //unit
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentAItemTableUnitRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableUnit.GetAt(i));
                }
                if(lstAgentBItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentBItemTableUnitRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableUnit.GetAt(i));
                }
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) == "" && lstAgentAItemTableUnitRowIdAccept.GetAt(i) == "" && lstAgentBItemTableUnitRowIdEdit.GetAt(i) == "" && lstAgentBItemTableUnitRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableUnit.GetAt(i) != null && lstAgentAItemTableUnit.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableUnit.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableUnit.GetAt(i));
                    }
                }   
                
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentBItemTableUnitRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableUnitRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableUnitRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //gross weight
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableGrossWeight.GetAt(i));
                }
                if(lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableGrossWeight.GetAt(i));
                }
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) == "" && lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) == "" && lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) == "" && lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableGrossWeight.GetAt(i) != null && lstAgentAItemTableGrossWeight.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableGrossWeight.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableGrossWeight.GetAt(i));
                    }
                }    
                
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }
            }

            //Send DACS
            let dacs = messages.QATaskDone.New();
            dacs.dnResponse.guid = stSelectedQAJobDeliveryNoteId;
            dacs.dnResponse.requestFileId = stSelectedQAJobId;
            dacs.dnResponse.avgscoreMustHave = 100.0;
            dacs.dnResponse.avgscoreOverall = 100.0;
            dacs.dnResponse.handwritten = 1;
            dacs.dnResponse.customerAddress = stSendAgentCustomerAddress;
            dacs.dnResponse.customerName = stSendAgentCustomerName;
            dacs.dnResponse.deliveryAddress = stSendAgentDeliveryAddress;
            dacs.dnResponse.deliveryRecipientName = stSendAgentDeliveryRecipientName;
            dacs.dnResponse.issueDate = stSendAgentIssueDate;
            dacs.dnResponse.orderNumber = stSendAgentOrderNumber;
            dacs.dnResponse.supplierAddress = stSendAgentSupplierAddress;
            dacs.dnResponse.supplierName = stSendAgentSupplierName;
            dacs.dnResponse.supplierTaxNumber = stSendAgentSupplierTaxNumber;
            dacs.dnResponse.supplierWarehouse = stSendAgentSupplierWarehouse;
            dacs.dnResponse.supplierId = stSendAgentSupplierId;
            dacs.dnResponse.weightGross = stSendAgentWeightGross;

            if(iCount != 0)
            {
                for (let i = 0; i < lstFinalItemTable.Count(); i=i+7) 
                {
                    let item = {

                        itemName: lstFinalItemTable.GetAt(1+i),
                        manufacturerItemNumber: lstFinalItemTable.GetAt(2+i),
                        taxNumber: lstFinalItemTable.GetAt(3+i),
                        amount: lstFinalItemTable.GetAt(4+i),
                        unit: lstFinalItemTable.GetAt(5+i),
                        grossWeight: lstFinalItemTable.GetAt(6+i)
                    };
                    dacs.dnResponse.items.Add(item);
                }
            }
            
            Log(dacs);
            dacs.Send();

            //QA job status update to handwritten
            //get current QA job's user
            let stCurrentJobUserId = "";
            let stCurrentJobUserName = "";
            let dtlCurrentJobStartTime = dtl.Now();

            let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stSelectedQAJobId},["user_id","job_start_time"]);

            for(let recData of lstCurrentJobUser)
            {
                let lstCurrentUser = db.ai_scan_user.ReadFields({id: recData.user_id},["name"]);

                for(let recUser of lstCurrentUser)
                {
                    stCurrentJobUserId = recData.user_id;
                    stCurrentJobUserName = recUser.name;
                    dtlCurrentJobStartTime = recData.job_start_time.DeclareAsDtl();
                }
            }

            //get job work time
            let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

            let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

            //create result 
            db.ai_scan_qa_job_result.InsertOrUpdate({
                job_id: stSelectedQAJobId
            },{
                delivery_note_id: stSelectedQAJobDeliveryNoteId,
                user_id: stCurrentJobUserId,
                user_name: stCurrentJobUserName,
                result: stresult,
                finish_date: dtl.Now().DtlToDtdb(),
                job_work_time_minutes: iJobWorkTime
            });

            //Set perfect point to Anot job if possible
            if((bMainTableEditedTextAvaiable == false && bItemTableEdittedVariable == false) && (bItemTableAOnlyAccepted == true || bMainTableOnlyAgentAAccepted == true) && (bItemTableBOnlyAccepted == false && bMainTableOnlyAgentBAccepted == false))
            {
                Log("Perfect Anot job: "+stSelectedQAJobSupplierANNOTJob1+" !");
                db.ai_scan_job_result.UpdateMany({
                    job_id: stSelectedQAJobSupplierANNOTJob1
                },{
                    perfect_job: 1
                });
            }

            if((bMainTableEditedTextAvaiable == false && bItemTableEdittedVariable == false) && (bItemTableBOnlyAccepted == true || bMainTableOnlyAgentBAccepted == true) && (bItemTableAOnlyAccepted == false && bMainTableOnlyAgentAAccepted == false))
            {
                Log("Perfect Anot job: "+stSelectedQAJobSupplierANNOTJob2+" !");
                db.ai_scan_job_result.UpdateMany({
                    job_id: stSelectedQAJobSupplierANNOTJob2
                },{
                    perfect_job: 1
                });
            }

            if(bMainTableEditedTextAvaiable == true || bItemTableEdittedVariable == true)
            {
                Log("No perfect Anot jobs");
            }

            //DEBUG Log (QA Job Handwritten DONE)
            Log("DEBUG");
            Log(stSelectedQAJobId);
            Log("QA Job Handwritten DONE  / status -> DONE");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stSelectedQAJobId
            },{
                status : "DONE",
                delivery_note_work_end_date: dtl.Now().DtlToDtdb(),
                delivery_note_work_time: dtl.Now().Diff(dtlSelectedQAJobDeliveryNoteWorkStartDate).TotalHours
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stSelectedQAJobId, user_id : stCurrentJobUserId});
        }

        if(sbApproved.submitter)
        {
            stresult = "Approved";

            let stSendAgentCustomerAddress = form.stSendAgentCustomerAddress;
            let stSendAgentCustomerName = form.stSendAgentCustomerName;
            let stSendAgentDeliveryAddress = form.stSendAgentDeliveryAddress;
            let stSendAgentDeliveryRecipientName = form.stSendAgentDeliveryRecipientName;
            let stSendAgentIssueDate = form.stSendAgentIssueDate;
            let stSendAgentOrderNumber = form.stSendAgentOrderNumber;
            let stSendAgentSupplierAddress = form.stSendAgentSupplierAddress;
            let stSendAgentSupplierName = form.stSendAgentSupplierName;
            let stSendAgentSupplierTaxNumber = form.stSendAgentSupplierTaxNumber;
            let stSendAgentSupplierWarehouse = form.stSendAgentSupplierWarehouse;
            let stSendAgentSupplierId = form.stSendAgentSupplierId;
            let stSendAgentWeightGross = form.stSendAgentWeightGross;

            let lstAgentAItemTableItemNameRowIdEdit = list.New();
            let lstAgentBItemTableItemNameRowIdEdit = list.New();
            let lstAgentAItemTableItemNameRowIdAccept = list.New();
            let lstAgentBItemTableItemNameRowIdAccept = list.New();
            let lstAgentAItemTableManufacturerItemNumberRowIdEdit = list.New();
            let lstAgentBItemTableManufacturerItemNumberRowIdEdit = list.New();
            let lstAgentAItemTableManufacturerItemNumberRowIdAccept = list.New();
            let lstAgentBItemTableManufacturerItemNumberRowIdAccept = list.New();
            let lstAgentAItemTableTaxNumberRowIdEdit = list.New();
            let lstAgentBItemTableTaxNumberRowIdEdit = list.New();
            let lstAgentAItemTableTaxNumberRowIdAccept = list.New();
            let lstAgentBItemTableTaxNumberRowIdAccept = list.New();
            let lstAgentAItemTableAmountRowIdEdit = list.New();
            let lstAgentBItemTableAmountRowIdEdit = list.New();
            let lstAgentAItemTableAmountRowIdAccept = list.New();
            let lstAgentBItemTableAmountRowIdAccept = list.New();
            let lstAgentAItemTableUnitRowIdEdit = list.New();
            let lstAgentBItemTableUnitRowIdEdit = list.New();
            let lstAgentAItemTableUnitRowIdAccept = list.New();
            let lstAgentBItemTableUnitRowIdAccept = list.New();
            let lstAgentAItemTableGrossWeightRowIdEdit = list.New();
            let lstAgentBItemTableGrossWeightRowIdEdit = list.New();
            let lstAgentAItemTableGrossWeightRowIdAccept = list.New();
            let lstAgentBItemTableGrossWeightRowIdAccept = list.New();

            let lstAgentAItemTableItemName = list.New();
            let lstAgentBItemTableItemName = list.New();
            let lstAgentAItemTableManufacturerItemNumber = list.New();
            let lstAgentBItemTableManufacturerItemNumber = list.New();
            let lstAgentAItemTableTaxNumber = list.New();
            let lstAgentBItemTableTaxNumber = list.New();
            let lstAgentAItemTableAmount = list.New();
            let lstAgentBItemTableAmount = list.New();
            let lstAgentAItemTableUnit = list.New();
            let lstAgentBItemTableUnit = list.New();
            let lstAgentAItemTableGrossWeight = list.New();
            let lstAgentBItemTableGrossWeight = list.New();
            
            let iCount = 0;

            let iSelectedQAJobAgentAResultItemTable = form.iSelectedQAJobAgentAResultItemTable;
            let iSelectedQAJobAgentBResultItemTable = form.iSelectedQAJobAgentBResultItemTable;

            let iRptItemTableAgentARowCount = form.iItemTableAgentARowCount;
            let iRptItemTableAgentBRowCount = form.iItemTableAgentBRowCount;

            if(iRptItemTableAgentARowCount == iRptItemTableAgentBRowCount)
            {
                iCount = iRptItemTableAgentARowCount;
            }
            else
            {
                if(iSelectedQAJobAgentAResultItemTable != 0 && iSelectedQAJobAgentBResultItemTable == 0)
                {
                    iCount = iSelectedQAJobAgentAResultItemTable;
                }
                else if(iSelectedQAJobAgentAResultItemTable == 0 && iSelectedQAJobAgentBResultItemTable != 0)
                {
                    iCount = iSelectedQAJobAgentBResultItemTable;
                }
                else
                {
                    iCount = 0;
                }
            }

            let lstFinalItemTable = list.New();

            if(iCount != 0)
            {
                for(let recData of form.rptItemTable.rows)
                {
                    lstAgentAItemTableItemNameRowIdEdit = recData.stEditItemAgentAItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemNameRowIdEdit = recData.stEditItemAgentBItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableItemNameRowIdAccept = recData.stAcceptItemAgentAItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemNameRowIdAccept = recData.stAcceptItemAgentBItemNameRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentAManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentBManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentAManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentBManufacturerItemNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumberRowIdEdit = recData.stEditItemAgentATaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumberRowIdEdit = recData.stEditItemAgentBTaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentATaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentBTaxNumberRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmountRowIdEdit = recData.stEditItemAgentAAmountRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmountRowIdEdit = recData.stEditItemAgentBAmountRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmountRowIdAccept = recData.stAcceptItemAgentAAmountRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmountRowIdAccept = recData.stAcceptItemAgentBAmountRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnitRowIdEdit = recData.stEditItemAgentAUnitRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnitRowIdEdit = recData.stEditItemAgentBUnitRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnitRowIdAccept = recData.stAcceptItemAgentAUnitRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnitRowIdAccept = recData.stAcceptItemAgentBUnitRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeightRowIdEdit = recData.stEditItemAgentAGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeightRowIdEdit = recData.stEditItemAgentBGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentAGrossWeightRowId.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentBGrossWeightRowId.SplitOnMany(["|"],false);

                    lstAgentAItemTableItemName = recData.stItemTableAItemName.SplitOnMany(["|"],false);
                    lstAgentBItemTableItemName = recData.stItemTableBItemName.SplitOnMany(["|"],false);
                    lstAgentAItemTableManufacturerItemNumber = recData.stItemTableAManufacturerItemNumber.SplitOnMany(["|"],false);
                    lstAgentBItemTableManufacturerItemNumber = recData.stItemTableBManufacturerItemNumber.SplitOnMany(["|"],false);
                    lstAgentAItemTableTaxNumber = recData.stItemTableATaxNumber.SplitOnMany(["|"],false);
                    lstAgentBItemTableTaxNumber = recData.stItemTableBTaxNumber.SplitOnMany(["|"],false);
                    lstAgentAItemTableAmount = recData.stItemTableAAmount.SplitOnMany(["|"],false);
                    lstAgentBItemTableAmount = recData.stItemTableBAmount.SplitOnMany(["|"],false);
                    lstAgentAItemTableUnit = recData.stItemTableAUnit.SplitOnMany(["|"],false);
                    lstAgentBItemTableUnit = recData.stItemTableBUnit.SplitOnMany(["|"],false);
                    lstAgentAItemTableGrossWeight = recData.stItemTableAGrossWeight.SplitOnMany(["|"],false);
                    lstAgentBItemTableGrossWeight = recData.stItemTableBGrossWeight.SplitOnMany(["|"],false);
                }
            }

            let bMainTableEditedTextAvaiable = form.bMainTableEditedTextAvaiable;
            let bMainTableOnlyAgentAAccepted = form.bMainTableOnlyAgentAAccepted;
            let bMainTableOnlyAgentBAccepted = form.bMainTableOnlyAgentBAccepted;

            let bItemTableEdittedVariable = false;
            let bItemTableAOnlyAccepted = false;
            let bItemTableBOnlyAccepted = false;

            for(let i = 0; i < iCount; i = i + 1)
            {
                //item row
                lstFinalItemTable.Add(i);

                //item name
                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentAItemTableItemNameRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableItemName.GetAt(i));
                }
                if(lstAgentBItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentBItemTableItemNameRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableItemName.GetAt(i));
                }
                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) == "" && lstAgentAItemTableItemNameRowIdAccept.GetAt(i) == "" && lstAgentBItemTableItemNameRowIdEdit.GetAt(i) == "" && lstAgentBItemTableItemNameRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableItemName.GetAt(i) != null && lstAgentAItemTableItemName.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableItemName.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableItemName.GetAt(i));
                    }
                }

                if(lstAgentAItemTableItemNameRowIdEdit.GetAt(i) != "" || lstAgentBItemTableItemNameRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableItemNameRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableItemNameRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //manufacturer item number
                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableManufacturerItemNumber.GetAt(i));
                }
                if(lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableManufacturerItemNumber.GetAt(i));
                }
                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableManufacturerItemNumber.GetAt(i) != null && lstAgentAItemTableManufacturerItemNumber.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableManufacturerItemNumber.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableManufacturerItemNumber.GetAt(i));
                    }
                }

                if(lstAgentAItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableManufacturerItemNumberRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableManufacturerItemNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //tax number
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableTaxNumber.GetAt(i));
                }
                if(lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableTaxNumber.GetAt(i));
                }
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableTaxNumber.GetAt(i) != null && lstAgentAItemTableTaxNumber.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableTaxNumber.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableTaxNumber.GetAt(i));
                    }
                }  
                
                if(lstAgentAItemTableTaxNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableTaxNumberRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableTaxNumberRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //amount number
                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentAItemTableAmountRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableAmount.GetAt(i));
                }
                if(lstAgentBItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableAmount.GetAt(i));
                }
                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) == "" && lstAgentAItemTableAmountRowIdAccept.GetAt(i) == "" && lstAgentBItemTableAmountRowIdEdit.GetAt(i) == "" && lstAgentBItemTableAmountRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableAmount.GetAt(i) != null && lstAgentAItemTableAmount.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableAmount.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableAmount.GetAt(i));
                    }
                }

                if(lstAgentAItemTableAmountRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableAmountRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableAmountRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //unit
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentAItemTableUnitRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableUnit.GetAt(i));
                }
                if(lstAgentBItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentBItemTableUnitRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableUnit.GetAt(i));
                }
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) == "" && lstAgentAItemTableUnitRowIdAccept.GetAt(i) == "" && lstAgentBItemTableUnitRowIdEdit.GetAt(i) == "" && lstAgentBItemTableUnitRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableUnit.GetAt(i) != null && lstAgentAItemTableUnit.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableUnit.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableUnit.GetAt(i));
                    }
                }   
                
                if(lstAgentAItemTableUnitRowIdEdit.GetAt(i) != "" || lstAgentBItemTableUnitRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableUnitRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableUnitRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }

                //gross weight
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentAItemTableGrossWeight.GetAt(i));
                }
                if(lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {                
                    lstFinalItemTable.Add(lstAgentBItemTableGrossWeight.GetAt(i));
                }
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) == "" && lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) == "" && lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) == "" && lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) == "")
                {
                    if(lstAgentAItemTableGrossWeight.GetAt(i) != null && lstAgentAItemTableGrossWeight.GetAt(i) != " ")
                    {
                        lstFinalItemTable.Add(lstAgentAItemTableGrossWeight.GetAt(i));
                    }
                    else
                    {
                        lstFinalItemTable.Add(lstAgentBItemTableGrossWeight.GetAt(i));
                    }
                }    
                
                if(lstAgentAItemTableGrossWeightRowIdEdit.GetAt(i) != "" || lstAgentBItemTableGrossWeightRowIdEdit.GetAt(i) != "")
                {
                    bItemTableEdittedVariable = true;
                }
                if(lstAgentAItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {
                    bItemTableAOnlyAccepted = true;
                }
                if(lstAgentBItemTableGrossWeightRowIdAccept.GetAt(i) != "")
                {
                    bItemTableBOnlyAccepted = true;
                }            
            }

            //Send DACS
            let dacs = messages.QATaskDone.New();
            dacs.dnResponse.guid = stSelectedQAJobDeliveryNoteId;
            dacs.dnResponse.requestFileId = stSelectedQAJobId;
            dacs.dnResponse.avgscoreMustHave = 100.0;
            dacs.dnResponse.avgscoreOverall = 100.0;
            dacs.dnResponse.accepted = 1;
            dacs.dnResponse.customerAddress = stSendAgentCustomerAddress;
            dacs.dnResponse.customerName = stSendAgentCustomerName;
            dacs.dnResponse.deliveryAddress = stSendAgentDeliveryAddress;
            dacs.dnResponse.deliveryRecipientName = stSendAgentDeliveryRecipientName;
            dacs.dnResponse.issueDate = stSendAgentIssueDate;
            dacs.dnResponse.orderNumber = stSendAgentOrderNumber;
            dacs.dnResponse.supplierAddress = stSendAgentSupplierAddress;
            dacs.dnResponse.supplierName = stSendAgentSupplierName;
            dacs.dnResponse.supplierTaxNumber = stSendAgentSupplierTaxNumber;
            dacs.dnResponse.supplierWarehouse = stSendAgentSupplierWarehouse;
            dacs.dnResponse.supplierId = stSendAgentSupplierId;
            dacs.dnResponse.weightGross = stSendAgentWeightGross;

            if(iCount != 0)
            {
                for (let i = 0; i < lstFinalItemTable.Count(); i=i+7) 
                {
                    let item = {

                        itemName: lstFinalItemTable.GetAt(1+i),
                        manufacturerItemNumber: lstFinalItemTable.GetAt(2+i),
                        taxNumber: lstFinalItemTable.GetAt(3+i),
                        amount: lstFinalItemTable.GetAt(4+i),
                        unit: lstFinalItemTable.GetAt(5+i),
                        grossWeight: lstFinalItemTable.GetAt(6+i)
                    };
                    dacs.dnResponse.items.Add(item);
                }
            }
            Log(dacs);
            dacs.Send();

            //QA job status update to approved
            //get current QA job's user
            let stCurrentJobUserId = "";
            let stCurrentJobUserName = "";
            let dtlCurrentJobStartTime = dtl.Now();

            let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stSelectedQAJobId},["user_id","job_start_time"]);

            for(let recData of lstCurrentJobUser)
            {
                let lstCurrentUser = db.ai_scan_user.ReadFields({id: recData.user_id},["name"]);

                for(let recUser of lstCurrentUser)
                {
                    stCurrentJobUserId = recData.user_id;
                    stCurrentJobUserName = recUser.name;
                    dtlCurrentJobStartTime = recData.job_start_time.DeclareAsDtl();
                }
            }

            //get job work time
            let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

            let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

            //create result 
            db.ai_scan_qa_job_result.InsertOrUpdate({
                job_id: stSelectedQAJobId
            },{
                delivery_note_id: stSelectedQAJobDeliveryNoteId,
                user_id: stCurrentJobUserId,
                user_name: stCurrentJobUserName,
                result: stresult,
                finish_date: dtl.Now().DtlToDtdb(),
                job_work_time_minutes: iJobWorkTime
            });

             //Set perfect point to Anot job if possible
             if((bMainTableEditedTextAvaiable == false && bItemTableEdittedVariable == false) && (bItemTableAOnlyAccepted == true || bMainTableOnlyAgentAAccepted == true) && (bItemTableBOnlyAccepted == false && bMainTableOnlyAgentBAccepted == false))
             {
                 Log("Perfect Anot job: "+stSelectedQAJobSupplierANNOTJob1+" !");
                 db.ai_scan_job_result.UpdateMany({
                     job_id: stSelectedQAJobSupplierANNOTJob1
                 },{
                     perfect_job: 1
                 });
             }
 
             if((bMainTableEditedTextAvaiable == false && bItemTableEdittedVariable == false) && (bItemTableBOnlyAccepted == true || bMainTableOnlyAgentBAccepted == true) && (bItemTableAOnlyAccepted == false && bMainTableOnlyAgentAAccepted == false))
             {
                 Log("Perfect Anot job: "+stSelectedQAJobSupplierANNOTJob2+" !");
                 db.ai_scan_job_result.UpdateMany({
                     job_id: stSelectedQAJobSupplierANNOTJob2
                 },{
                     perfect_job: 1
                 });
             }
 
             if(bMainTableEditedTextAvaiable == true || bItemTableEdittedVariable == true)
             {
                 Log("No perfect Anot jobs");
             }

            //DEBUG Log (QA Job Approved DONE)
            Log("DEBUG");
            Log(stSelectedQAJobId);
            Log("QA Job Approved DONE  / status -> DONE");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stSelectedQAJobId
            },{
                status : "DONE",
                delivery_note_work_end_date: dtl.Now().DtlToDtdb(),
                delivery_note_work_time: dtl.Now().Diff(dtlSelectedQAJobDeliveryNoteWorkStartDate).TotalHours
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stSelectedQAJobId, user_id : stCurrentJobUserId});
        }
        if (stresult!="") {
            Log("QA job with delivery note: "+stSelectedQAJobDeliveryNoteId+" complited with the following result: "+stresult);
        }
        
        if(bCancel)
        {
            Log("Cancel");

            // Update current job history with new online user
            let stCurrentQAJobId = stSelectedQAJobId;
            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (QA Job Cancel)
            Log("DEBUG");
            Log(stCurrentQAJobId);
            Log("QA Job Cancel  / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentQAJobId
            },{
                status : "UNCHECKED",
                current_user: null
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
        }

        if(bDelayCancel)
        {
            Log("Delay Cancel");

            // Update current job history with new online user
            let stCurrentQAJobId = stSelectedQAJobId;
            let stCurrentUser = stLoggedUserId;

            //DEBUG Log (QA Job Delay)
            Log("DEBUG");
            Log(stCurrentQAJobId);
            Log("QA Job Delay  / status -> UNCHECKED");

            // Update the job in ai_scan_jobs table
            db.ai_scan_jobs.UpdateMany({
                id : stCurrentQAJobId
            },{
                status : "UNCHECKED",
                current_user: null,
                delay_time: dtl.Now().DtlAddHours(int.Parse(stDelayTime)).DtlToDtdb()
            });

            // Delete the job in ai_scan_job_inprogress table
            db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
        }
    }
    
}