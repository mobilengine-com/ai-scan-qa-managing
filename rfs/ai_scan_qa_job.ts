//# server program ai_scan_qa_job for form ai_scan_qa_job
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_qa_job_result;
//# using reftab ai_scan_user;
//# using dacs QATaskDone;

{
    let bBadPhoto = form.bBadPhoto;
    let bCancel = form.bCancel;
    let bDelayCancel = form.bDelayCancel;

    let sbHandwritten = form.sbtnHandwritten;
    let sbApproved = form.sbtnApprove;

    let stLoggedUserId = form.stLoggedUserId;
    let stSelectedQAJobId = form.stSelectedQAJobId;
    let stSelectedQAJobDeliveryNoteId = form.stSelectedQAJobAnotJobsAgentADeliveryNoteId;
    let stresult = "";

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
        db.ai_scan_qa_job_result.Insert({
            job_id: stSelectedQAJobId,
            delivery_note_id: stSelectedQAJobDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            result: stresult,
            job_work_time_minutes: iJobWorkTime
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stSelectedQAJobId
        },{
            status : "DONE"
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
        let lstAgentAItemTableAmountNumberRowIdEdit = list.New();
        let lstAgentBItemTableAmountNumberRowIdEdit = list.New();
        let lstAgentAItemTableAmountNumberRowIdAccept = list.New();
        let lstAgentBItemTableAmountNumberRowIdAccept = list.New();
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
        let lstAgentAItemTableAmountNumber = list.New();
        let lstAgentBItemTableAmountNumber = list.New();
        let lstAgentAItemTableUnit = list.New();
        let lstAgentBItemTableUnit = list.New();
        let lstAgentAItemTableGrossWeight = list.New();
        let lstAgentBItemTableGrossWeight = list.New();

        let lstDefaultItemTableItemName = form.ltblSelectedQAJobAgentAResultItemTable;

        for(let recData of form.rptItemTable.rows)
        {
            lstAgentAItemTableItemNameRowIdEdit = recData.stEditItemAgentAItemNameRowId.SplitOnMany([","],false);
            lstAgentBItemTableItemNameRowIdEdit = recData.stEditItemAgentBItemNameRowId.SplitOnMany([","],false);
            lstAgentAItemTableItemNameRowIdAccept = recData.stAcceptItemAgentAItemNameRowId.SplitOnMany([","],false);
            lstAgentBItemTableItemNameRowIdAccept = recData.stAcceptItemAgentBItemNameRowId.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentAManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentBManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentAManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentBManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumberRowIdEdit = recData.stEditItemAgentATaxNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumberRowIdEdit = recData.stEditItemAgentBTaxNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentATaxNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentBTaxNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumberRowIdEdit = recData.stEditItemAgentAAmountNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumberRowIdEdit = recData.stEditItemAgentBAmountNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumberRowIdAccept = recData.stAcceptItemAgentAAmountNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumberRowIdAccept = recData.stAcceptItemAgentBAmountNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableUnitRowIdEdit = recData.stEditItemAgentAUnitRowId.SplitOnMany([","],false);
            lstAgentBItemTableUnitRowIdEdit = recData.stEditItemAgentBUnitRowId.SplitOnMany([","],false);
            lstAgentAItemTableUnitRowIdAccept = recData.stAcceptItemAgentAUnitRowId.SplitOnMany([","],false);
            lstAgentBItemTableUnitRowIdAccept = recData.stAcceptItemAgentBUnitRowId.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeightRowIdEdit = recData.stEditItemAgentAGrossWeightRowId.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeightRowIdEdit = recData.stEditItemAgentBGrossWeightRowId.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentAGrossWeightRowId.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentBGrossWeightRowId.SplitOnMany([","],false);

            lstAgentAItemTableItemName = recData.stItemTableAItemName.SplitOnMany([","],false);
            lstAgentBItemTableItemName = recData.stItemTableBItemName.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumber = recData.stItemTableAManufacturerItemNumber.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumber = recData.stItemTableBManufacturerItemNumber.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumber = recData.stItemTableATaxNumber.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumber = recData.stItemTableBTaxNumber.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumber = recData.stItemTableAAmountNumber.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumber = recData.stItemTableBAmountNumber.SplitOnMany([","],false);
            lstAgentAItemTableUnit = recData.stItemTableAUnit.SplitOnMany([","],false);
            lstAgentBItemTableUnit = recData.stItemTableBUnit.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeight = recData.stItemTableAGrossWeight.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeight = recData.stItemTableBGrossWeight.SplitOnMany([","],false);
        }
        
        let iCount = 0;

        let iSelectedQAJobAgentAResultItemTable = form.iSelectedQAJobAgentAResultItemTable;
        //let iSelectedQAJobAgentBResultItemTable = form.iSelectedQAJobAgentBResultItemTable;

        let iRptItemTableAgentARowCount = form.iItemTableAgentARowCount;
        let iRptItemTableAgentBRowCount = form.iItemTableAgentBRowCount;

        if(iRptItemTableAgentARowCount == iRptItemTableAgentBRowCount)
        {
            iCount = iRptItemTableAgentARowCount;
        }
        else
        {
            iCount = iSelectedQAJobAgentAResultItemTable;
        }
        
        let lstFinalItemTable = list.New();

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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).item_name);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).manufacturer_item_number);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).tax_number);
            }

            //amount number
            if(lstAgentAItemTableAmountNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableAmountNumberRowIdAccept.GetAt(i) != "")
            {                
                lstFinalItemTable.Add(lstAgentAItemTableAmountNumber.GetAt(i));
            }
            if(lstAgentBItemTableAmountNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountNumberRowIdAccept.GetAt(i) != "")
            {                
                lstFinalItemTable.Add(lstAgentBItemTableAmountNumber.GetAt(i));
            }
            if(lstAgentAItemTableAmountNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableAmountNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableAmountNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableAmountNumberRowIdAccept.GetAt(i) == "")
            {
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).amount_number);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).unit);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).gross_weight);
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

        for(let recDacsData of lstFinalItemTable)
        {
            dacs.dnResponse.items.Add(recDacsData);
        }

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
        db.ai_scan_qa_job_result.Insert({
            job_id: stSelectedQAJobId,
            delivery_note_id: stSelectedQAJobDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            result: stresult,
            job_work_time_minutes: iJobWorkTime
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stSelectedQAJobId
        },{
            status : "DONE"
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
        let lstAgentAItemTableAmountNumberRowIdEdit = list.New();
        let lstAgentBItemTableAmountNumberRowIdEdit = list.New();
        let lstAgentAItemTableAmountNumberRowIdAccept = list.New();
        let lstAgentBItemTableAmountNumberRowIdAccept = list.New();
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
        let lstAgentAItemTableAmountNumber = list.New();
        let lstAgentBItemTableAmountNumber = list.New();
        let lstAgentAItemTableUnit = list.New();
        let lstAgentBItemTableUnit = list.New();
        let lstAgentAItemTableGrossWeight = list.New();
        let lstAgentBItemTableGrossWeight = list.New();

        let lstDefaultItemTableItemName = form.ltblSelectedQAJobAgentAResultItemTable;

        for(let recData of form.rptItemTable.rows)
        {
            lstAgentAItemTableItemNameRowIdEdit = recData.stEditItemAgentAItemNameRowId.SplitOnMany([","],false);
            lstAgentBItemTableItemNameRowIdEdit = recData.stEditItemAgentBItemNameRowId.SplitOnMany([","],false);
            lstAgentAItemTableItemNameRowIdAccept = recData.stAcceptItemAgentAItemNameRowId.SplitOnMany([","],false);
            lstAgentBItemTableItemNameRowIdAccept = recData.stAcceptItemAgentBItemNameRowId.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentAManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumberRowIdEdit = recData.stEditItemAgentBManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentAManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumberRowIdAccept = recData.stAcceptItemAgentBManufacturerItemNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumberRowIdEdit = recData.stEditItemAgentATaxNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumberRowIdEdit = recData.stEditItemAgentBTaxNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentATaxNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumberRowIdAccept = recData.stAcceptItemAgentBTaxNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumberRowIdEdit = recData.stEditItemAgentAAmountNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumberRowIdEdit = recData.stEditItemAgentBAmountNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumberRowIdAccept = recData.stAcceptItemAgentAAmountNumberRowId.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumberRowIdAccept = recData.stAcceptItemAgentBAmountNumberRowId.SplitOnMany([","],false);
            lstAgentAItemTableUnitRowIdEdit = recData.stEditItemAgentAUnitRowId.SplitOnMany([","],false);
            lstAgentBItemTableUnitRowIdEdit = recData.stEditItemAgentBUnitRowId.SplitOnMany([","],false);
            lstAgentAItemTableUnitRowIdAccept = recData.stAcceptItemAgentAUnitRowId.SplitOnMany([","],false);
            lstAgentBItemTableUnitRowIdAccept = recData.stAcceptItemAgentBUnitRowId.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeightRowIdEdit = recData.stEditItemAgentAGrossWeightRowId.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeightRowIdEdit = recData.stEditItemAgentBGrossWeightRowId.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentAGrossWeightRowId.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeightRowIdAccept = recData.stAcceptItemAgentBGrossWeightRowId.SplitOnMany([","],false);

            lstAgentAItemTableItemName = recData.stItemTableAItemName.SplitOnMany([","],false);
            lstAgentBItemTableItemName = recData.stItemTableBItemName.SplitOnMany([","],false);
            lstAgentAItemTableManufacturerItemNumber = recData.stItemTableAManufacturerItemNumber.SplitOnMany([","],false);
            lstAgentBItemTableManufacturerItemNumber = recData.stItemTableBManufacturerItemNumber.SplitOnMany([","],false);
            lstAgentAItemTableTaxNumber = recData.stItemTableATaxNumber.SplitOnMany([","],false);
            lstAgentBItemTableTaxNumber = recData.stItemTableBTaxNumber.SplitOnMany([","],false);
            lstAgentAItemTableAmountNumber = recData.stItemTableAAmountNumber.SplitOnMany([","],false);
            lstAgentBItemTableAmountNumber = recData.stItemTableBAmountNumber.SplitOnMany([","],false);
            lstAgentAItemTableUnit = recData.stItemTableAUnit.SplitOnMany([","],false);
            lstAgentBItemTableUnit = recData.stItemTableBUnit.SplitOnMany([","],false);
            lstAgentAItemTableGrossWeight = recData.stItemTableAGrossWeight.SplitOnMany([","],false);
            lstAgentBItemTableGrossWeight = recData.stItemTableBGrossWeight.SplitOnMany([","],false);
        }
        
        let iCount = 0;

        let iSelectedQAJobAgentAResultItemTable = form.iSelectedQAJobAgentAResultItemTable;
        //let iSelectedQAJobAgentBResultItemTable = form.iSelectedQAJobAgentBResultItemTable;

        let iRptItemTableAgentARowCount = form.iItemTableAgentARowCount;
        let iRptItemTableAgentBRowCount = form.iItemTableAgentBRowCount;

        if(iRptItemTableAgentARowCount == iRptItemTableAgentBRowCount)
        {
            iCount = iRptItemTableAgentARowCount;
        }
        else
        {
            iCount = iSelectedQAJobAgentAResultItemTable;
        }
        
        let lstFinalItemTable = list.New();

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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).item_name);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).manufacturer_item_number);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).tax_number);
            }

            //amount number
            if(lstAgentAItemTableAmountNumberRowIdEdit.GetAt(i) != "" || lstAgentAItemTableAmountNumberRowIdAccept.GetAt(i) != "")
            {                
                lstFinalItemTable.Add(lstAgentAItemTableAmountNumber.GetAt(i));
            }
            if(lstAgentBItemTableAmountNumberRowIdEdit.GetAt(i) != "" || lstAgentBItemTableAmountNumberRowIdAccept.GetAt(i) != "")
            {                
                lstFinalItemTable.Add(lstAgentBItemTableAmountNumber.GetAt(i));
            }
            if(lstAgentAItemTableAmountNumberRowIdEdit.GetAt(i) == "" && lstAgentAItemTableAmountNumberRowIdAccept.GetAt(i) == "" && lstAgentBItemTableAmountNumberRowIdEdit.GetAt(i) == "" && lstAgentBItemTableAmountNumberRowIdAccept.GetAt(i) == "")
            {
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).amount_number);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).unit);
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
                lstFinalItemTable.Add(lstDefaultItemTableItemName.GetAt(i).gross_weight);
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

        for(let recDacsData of lstFinalItemTable)
        {
            dacs.dnResponse.items.Add(recDacsData);
        }

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
        db.ai_scan_qa_job_result.Insert({
            job_id: stSelectedQAJobId,
            delivery_note_id: stSelectedQAJobDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            result: stresult,
            job_work_time_minutes: iJobWorkTime
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stSelectedQAJobId
        },{
            status : "DONE"
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

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stCurrentQAJobId
        },{
            status : "UNCHECKED",
            current_user: null,
            delay_time: dtl.Now().DtlAddHours(1).DtlToDtdb()
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stCurrentQAJobId, user_id : stCurrentUser});
    }
}