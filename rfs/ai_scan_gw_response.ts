//# server program ai_scan_gw_response for dacs AITaskResult
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_user;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_job_result;
//# using reftab ai_scan_settings;
//# using dacs QATaskDone;
//# using dacs AssignAITask;

{
    let rgstdtf = ["yyyy\".\"MM\".\"dd\".\"", "yyyy\". \"MM\". \"dd\".\"", "yyyy\"-\"MM\"-\"dd", "yyyy\":\"MM\":\"dd", "dd\".\"MM\".\"yyyy\".\"", "dd\". \"MM\". \"yyyy\".\"", "dd\"-\"MM\"-\"yyyy", "dd\":\"MM\":\"yyyy"];
    let rgnf = [
      {decimalSeparator: ",",   groupSize: 3, groupSeparator: "."},
      {decimalSeparator: ",",   groupSize: 3, groupSeparator: " "},
      {decimalSeparator: ".",   groupSize: 3, groupSeparator: " "},
      {decimalSeparator: ".",   groupSize: 3, groupSeparator: ","}
    ];

    let DateFrom = function(st) {
        if (st == null || st == undefined) 
            return null;

        Log(["rgstdtf", rgstdtf]);
        for (let stdtf of rgstdtf) {
          Log(["stdtf", stdtf]);
          let dtlIssueDate = dtl.Parse(dtf.Parse(stdtf), st);
          if (dtlIssueDate != undefined) {
            Log(["date", st, "parsed with ", stdtf, ": ", dtlIssueDate.DtlToDtdb()]);
            return dtlIssueDate.DtlToDtdb();
          }
        }
        return null;
    };

    let NumberFrom = function (st) {
        if (st == null || st == undefined) 
            return null;
        for (let nf of rgnf) {
            let n = float.ParseNuf(nf, st);
            if (n != undefined) {
              Log(["number", st, "parsed with ", nf]);
              return n;
            }
          }
          return null;
    };

    Log(dacs);

    //Delivery note job "done" status
    if(dacs.dnResponse.accepted == 1)
    {
        let stDeliveryNoteId = dacs.dnResponse.guid;
        let stDeliveryNoteJobId = dacs.dnResponse.requestFileId;

        //get Delivery note job datas
        let bDeliveryNoteStatus = dacs.dnResponse.accepted == 1;
        let stDeliveryNoteStatus = bDeliveryNoteStatus ? "done" : "waiting";
        let stDeliveryNoteCustomerAddress = dacs.dnResponse.customerAddress;
        let stDeliveryNoteCustomerName = dacs.dnResponse.customerName;
        let stDeliveryNoteDeliveryAddress = dacs.dnResponse.deliveryAddress;
        let stDeliveryNoteDeliveryRecipientName = dacs.dnResponse.deliveryRecipientName;
        let stDeliveryNoteIssueDate = dacs.dnResponse.issueDate;
        let stDeliveryNoteDtlIssueDate = DateFrom(stDeliveryNoteIssueDate);
        let stDeliveryNoteOrderNumber = dacs.dnResponse.orderNumber;
        let stDeliveryNoteSupplierAddress = dacs.dnResponse.supplierAddress;
        let stDeliveryNoteSupplierName = dacs.dnResponse.supplierName;
        let stDeliveryNoteSupplierTaxNumber = dacs.dnResponse.supplierTaxNumber;
        let stDeliveryNoteSupplierWarehouse = dacs.dnResponse.supplierWarehouse;
        let stDeliveryNoteSupplierId = dacs.dnResponse.supplierId;
        let stDeliveryNoteWeightGross = dacs.dnResponse.weightGross;

        // Update delivery_note job
        db.ai_scan_delivery_note_job.UpdateMany({
            job_id: stDeliveryNoteJobId
        },{
            status: stDeliveryNoteStatus,
            customer_address: stDeliveryNoteCustomerAddress,
            customer_name: stDeliveryNoteCustomerName,
            delivery_address: stDeliveryNoteDeliveryAddress,
            delivery_recipient_name: stDeliveryNoteDeliveryRecipientName,
            issue_date: stDeliveryNoteIssueDate,
            dtl_issue_date: stDeliveryNoteDtlIssueDate,
            order_number: stDeliveryNoteOrderNumber,
            supplier_address: stDeliveryNoteSupplierAddress,
            supplier_name: stDeliveryNoteSupplierName,
            supplier_tax_number: stDeliveryNoteSupplierTaxNumber,
            supplier_warehouse: stDeliveryNoteSupplierWarehouse,
            supplier_id: stDeliveryNoteSupplierId,
            weight_gross: stDeliveryNoteWeightGross
        });

        // delivery_note's items

        let lstJobDeliveryNoteItemItemName = list.New();
        let lstJobDeliveryNoteItemManufacturerItemNumber = list.New();
        let lstJobDeliveryNoteItemTaxNumber = list.New();
        let lstJobDeliveryNoteItemAmount = list.New();
        let lstJobDeliveryNoteItemNumberAmount = list.New();
        let lstJobDeliveryNoteItemUnit = list.New();
        let lstJobDeliveryNoteItemGrossWeight = list.New();

        let i = 0;
        for (let item of dacs.dnResponse.items) {
            let iDeliveryNoteItemRowCounter = i;
            let stDeliveryNoteItemItemName = item.itemName;
            let stDeliveryNoteItemManufacturerItemNumber = item.manufacturerItemNumber;
            let stDeliveryNoteItemTaxNumber = item.taxNumber;
            let stDeliveryNoteItemAmount = item.amount;
            let iDeliveryNoteItemAmount = NumberFrom(item.amount);
            let stDeliveryNoteItemUnit = item.unit;
            let stDeliveryNoteItemGrossWeight = item.grossWeight;

            lstJobDeliveryNoteItemItemName.Add(stDeliveryNoteItemItemName);
            lstJobDeliveryNoteItemManufacturerItemNumber.Add(stDeliveryNoteItemManufacturerItemNumber);
            lstJobDeliveryNoteItemTaxNumber.Add(stDeliveryNoteItemTaxNumber);
            lstJobDeliveryNoteItemAmount.Add(stDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemNumberAmount.Add(iDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemUnit.Add(stDeliveryNoteItemUnit);
            lstJobDeliveryNoteItemGrossWeight.Add(stDeliveryNoteItemGrossWeight);

            // Update delivery_note job
            db.ai_scan_delivery_note_item_job.InsertOrUpdate({
                delivery_note_id: stDeliveryNoteId,
                job_id: stDeliveryNoteJobId,
                row_counter: iDeliveryNoteItemRowCounter
            },{
                item_name: stDeliveryNoteItemItemName,
                manufacturer_item_number: stDeliveryNoteItemManufacturerItemNumber,
                tax_number: stDeliveryNoteItemTaxNumber,
                amount: stDeliveryNoteItemAmount,
                amount_number: iDeliveryNoteItemAmount,
                unit: stDeliveryNoteItemUnit,
                gross_weight: stDeliveryNoteItemGrossWeight
            });

            i=i+1;
        }

        let iJobJobDeliveryNoteItems = i;

        let stJobResultStatus = "APPROVED";

        //get current job's user
        let stCurrentJobUserId = "";
        let stCurrentJobUserName = "";
        let dtlCurrentJobStartTime = dtl.Now();

        let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stDeliveryNoteJobId},["user_id","job_start_time"]);

        if(lstCurrentJobUser.Count() != 0)
        {
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
        }
        else
        {
            let lstCurrentJobUserinHistory = db.ai_scan_jobs_history.ReadFields({id: stDeliveryNoteJobId},["users"]);

            Log("LastUserId");

            let stLastUsersIds = lstCurrentJobUserinHistory.GetAt(0).users;

            let iLastIndex = stLastUsersIds.LastIndexOf(",");

            let stLastUserId = stLastUsersIds.SubString(iLastIndex + 1, stLastUsersIds.Length() - (iLastIndex + 1));

            Log(stLastUserId);

            let lstCurrentUser = db.ai_scan_user.ReadFields({id: stLastUserId},["name"]);

            for(let recUser of lstCurrentUser)
            {
                stCurrentJobUserId = stLastUserId;
                stCurrentJobUserName = recUser.name;
            }
        }

        //get current job's language and supplier id
        let stCurrentJobLanguage = "";
        let stCurrentJobSupplierId = "";
        let dtlCurrentDeliveryNoteStartWorkingTime = dtl.Now();
        let stCurrentJobRedo = "";

        let lstCurrentJobLanguageAndSupplierIdAndStartDate = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteJobId},["supplier_id","lang","delivery_note_work_start_date","redo_delivery_note"]);

        for(let recData of lstCurrentJobLanguageAndSupplierIdAndStartDate)
        {
            stCurrentJobSupplierId = recData.supplier_id;
            stCurrentJobLanguage = recData.lang;
            dtlCurrentDeliveryNoteStartWorkingTime = recData.delivery_note_work_start_date.DeclareAsDtl();
            stCurrentJobRedo = recData.redo_delivery_note;
        }

        //get job work time
        let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

        let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

        //create result 
        db.ai_scan_job_result.InsertOrUpdate({
            job_id: stDeliveryNoteJobId
        },{
            delivery_note_id: stDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            finish_date: dtl.Now().DtlToDtdb(),
            result: stJobResultStatus,
            job_work_time_minutes: iJobWorkTime,
            perfect_job: 0
        });

        //DEBUG Log (Get approved ANOT Job result)
        Log("DEBUG");
        Log(stDeliveryNoteJobId);
        Log("Get approved ANOT Job result  / status -> DONE");

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stDeliveryNoteJobId
        },{
            status : "DONE",
            current_user : stCurrentJobUserId
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stDeliveryNoteJobId, user_id : stCurrentJobUserId});

        //Remove user from ANNOT job on AI page
        let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stDeliveryNoteJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
        let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;
        
        let dacs2 = messages.AssignAITask.New();
        dacs2.assignTask.scanId = stscanId;
        dacs2.assignTask.requestFileId = stDeliveryNoteJobId;
        dacs2.assignTask.agent = stDefaultAIUser;
        //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs2.Send();

        //Get delivery note other job
        let stDeliveryNoteOtherJob = "";

        let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({delivery_note_id: stDeliveryNoteId},["job_id"]);

        for(let recDNJ of lstDeliveryNoteJobs)
        {
            if(recDNJ.job_id != stDeliveryNoteJobId)
            {
                stDeliveryNoteOtherJob = recDNJ.job_id;
            }
        }

        //Get delivery note other job user
        let stDeliveryNoteOtherJobUser = "";

        let lstDeliveryNoteOtherJob = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteOtherJob},["current_user"]);

        for(let recJH of lstDeliveryNoteOtherJob)
        {
            stDeliveryNoteOtherJobUser = recJH.current_user;
        }


        //If delivery note other job finished
        let lstDeliveryNoteOtherJobStatus = db.ai_scan_job_result.ReadFields({job_id: stDeliveryNoteOtherJob},["job_id","result"]);

        if(lstDeliveryNoteOtherJobStatus.Count() != 0)
        {
            //If two ANNOT jobs 100% same
            //Other ANNOT jobs delivery note datas
            let bSameANNOTDatas = false;
            let bSameANNOTItemsDatas = true;

            let stOtherJobDeliveryNoteCustomerAddress = "";
            let stOtherJobDeliveryNoteCustomerName = "";
            let stOtherJobDeliveryNoteDeliveryAddress = "";
            let stOtherJobDeliveryNoteDeliveryRecipientName = "";
            let stOtherJobDeliveryNoteIssueDate = "";
            let stOtherJobDeliveryNoteDtlIssueDate = "";
            let stOtherJobDeliveryNoteOrderNumber = "";
            let stOtherJobDeliveryNoteSupplierAddress = "";
            let stOtherJobDeliveryNoteSupplierName = "";
            let stOtherJobDeliveryNoteSupplierTaxNumber = "";
            let stOtherJobDeliveryNoteSupplierWarehouse = "";
            let stOtherJobDeliveryNoteSupplierId = "";
            let stOtherJobDeliveryNoteWeightGross = "";

            let lstOtherJobDeliveryNote = db.ai_scan_delivery_note_job.Read({job_id : stDeliveryNoteOtherJob});

            for(let recData of lstOtherJobDeliveryNote)
            {
                stOtherJobDeliveryNoteCustomerAddress = recData.customer_address;
                stOtherJobDeliveryNoteCustomerName = recData.customer_name;
                stOtherJobDeliveryNoteDeliveryAddress = recData.delivery_address;
                stOtherJobDeliveryNoteDeliveryRecipientName = recData.delivery_recipient_name;
                stOtherJobDeliveryNoteIssueDate = recData.issue_date;
                stOtherJobDeliveryNoteDtlIssueDate = DateFrom(stOtherJobDeliveryNoteIssueDate);
                stOtherJobDeliveryNoteOrderNumber = recData.order_number;
                stOtherJobDeliveryNoteSupplierAddress = recData.supplier_address;
                stOtherJobDeliveryNoteSupplierName = recData.supplier_name;
                stOtherJobDeliveryNoteSupplierTaxNumber = recData.supplier_tax_number;
                stOtherJobDeliveryNoteSupplierWarehouse = recData.supplier_warehouse;
                stOtherJobDeliveryNoteSupplierId = recData.supplier_id;
                stOtherJobDeliveryNoteWeightGross = recData.weight_gross;
            }

            if(stOtherJobDeliveryNoteCustomerAddress == stDeliveryNoteCustomerAddress && 
                stOtherJobDeliveryNoteCustomerName == stDeliveryNoteCustomerName &&
                stOtherJobDeliveryNoteDeliveryAddress == stDeliveryNoteDeliveryAddress &&
                stOtherJobDeliveryNoteDeliveryRecipientName == stDeliveryNoteDeliveryRecipientName &&
                stOtherJobDeliveryNoteIssueDate == stDeliveryNoteIssueDate &&
                stOtherJobDeliveryNoteOrderNumber == stDeliveryNoteOrderNumber &&
                stOtherJobDeliveryNoteSupplierAddress == stDeliveryNoteSupplierAddress &&
                stOtherJobDeliveryNoteSupplierName == stDeliveryNoteSupplierName &&
                stOtherJobDeliveryNoteSupplierTaxNumber == stDeliveryNoteSupplierTaxNumber &&
                stOtherJobDeliveryNoteSupplierWarehouse == stDeliveryNoteSupplierWarehouse &&
                stOtherJobDeliveryNoteSupplierId == stDeliveryNoteSupplierId &&
                stOtherJobDeliveryNoteWeightGross == stDeliveryNoteWeightGross)
            {
                bSameANNOTDatas = true;
            }

            //Other ANNOT jobs delivery note's items datas
            let lstOtherJobJobDeliveryNoteItemItemName = list.New();
            let lstOtherJobJobDeliveryNoteItemManufacturerItemNumber = list.New();
            let lstOtherJobJobDeliveryNoteItemTaxNumber = list.New();
            let lstOtherJobJobDeliveryNoteItemAmount = list.New();
            let lstOtherJobJobDeliveryNoteItemNumberAmount = list.New();
            let lstOtherJobJobDeliveryNoteItemUnit = list.New();
            let lstOtherJobJobDeliveryNoteItemGrossWeight = list.New();
    
            let lstOtherJobJobDeliveryNoteItems = db.ai_scan_delivery_note_item_job.Read({job_id : stDeliveryNoteOtherJob});
    
            for(let recData of lstOtherJobJobDeliveryNoteItems)
            {
                lstOtherJobJobDeliveryNoteItemItemName.Add(recData.item_name);
                lstOtherJobJobDeliveryNoteItemManufacturerItemNumber.Add(recData.manufacturer_item_number);
                lstOtherJobJobDeliveryNoteItemTaxNumber.Add(recData.tax_number);
                lstOtherJobJobDeliveryNoteItemAmount.Add(recData.amount);
                lstOtherJobJobDeliveryNoteItemNumberAmount.Add(NumberFrom(recData.amount));
                lstOtherJobJobDeliveryNoteItemUnit.Add(recData.unit);
                lstOtherJobJobDeliveryNoteItemGrossWeight.Add(recData.gross_weight);
            }

            let bMofifiedAnywhere = false;

            if(lstOtherJobJobDeliveryNoteItems.Count() == i)
            {
                for(let l = 0;l<lstOtherJobJobDeliveryNoteItems.Count();l=l+1)
                {
                    if(lstOtherJobJobDeliveryNoteItemItemName.GetAt(l) != lstJobDeliveryNoteItemItemName.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemManufacturerItemNumber.GetAt(l) != lstJobDeliveryNoteItemManufacturerItemNumber.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemTaxNumber.GetAt(l) != lstJobDeliveryNoteItemTaxNumber.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemAmount.GetAt(l) != lstJobDeliveryNoteItemAmount.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemNumberAmount.GetAt(l) != lstJobDeliveryNoteItemNumberAmount.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemUnit.GetAt(l) != lstJobDeliveryNoteItemUnit.GetAt(l) ||
                        lstOtherJobJobDeliveryNoteItemGrossWeight.GetAt(l) != lstJobDeliveryNoteItemGrossWeight.GetAt(l))
                    {
                        bMofifiedAnywhere = true;
                    }
                }
            }

            if(lstOtherJobJobDeliveryNoteItems.Count() != iJobJobDeliveryNoteItems)
            {
                bSameANNOTItemsDatas = false;
            }

            if(bMofifiedAnywhere == true)
            {
                bSameANNOTItemsDatas = false;
            }

            let stOtherJobResultStatus = "";
            for(let recData of lstDeliveryNoteOtherJobStatus)
            {
                stOtherJobResultStatus = recData.result;
            }

            if(stJobResultStatus != "" && stOtherJobResultStatus != "")
            {
                if(bSameANNOTDatas == true && bSameANNOTItemsDatas == true && stJobResultStatus != "REJECTED" && stOtherJobResultStatus != "REJECTED")
                {
                    Log("Perfect Approved Annotations");
                    Log(dtlCurrentDeliveryNoteStartWorkingTime);
                    Log(dtl.Now());
                    Log(dtl.Now().Diff(dtlCurrentDeliveryNoteStartWorkingTime));
                    db.ai_scan_jobs.UpdateMany({
                        type: "ANOT",
                        status: "DONE",
                        delivery_note_id: stDeliveryNoteId
                    },{
                        delivery_note_work_end_date: dtl.Now().DtlToDtdb(),
                        delivery_note_work_time: dtl.Now().Diff(dtlCurrentDeliveryNoteStartWorkingTime).TotalHours,
                        delay_time: null
                    });

                    //Add perfect point to selected Anot jobs
                    //First Anot job
                    db.ai_scan_job_result.UpdateMany({
                        job_id: stDeliveryNoteJobId
                    },{
                        perfect_job: 1
                    });
                    //Second Anot job
                    db.ai_scan_job_result.UpdateMany({
                        job_id: stDeliveryNoteOtherJob
                    },{
                        perfect_job: 1
                    });

                    //TODO Send QATaskDone with data which is received in this dacs. 
                    let doneDacs = messages.QATaskDone.New();
                    Log(stDeliveryNoteId);
                   doneDacs.dnResponse.avgscoreMustHave = dacs.dnResponse.avgscoreMustHave;
                   doneDacs.dnResponse.avgscoreOverall = dacs.dnResponse.avgscoreOverall;
                   doneDacs.dnResponse.guid = stDeliveryNoteId;
                   doneDacs.dnResponse.requestFileId = stDeliveryNoteJobId;
                   doneDacs.dnResponse.accepted = 1;
                   doneDacs.dnResponse.customerAddress = stDeliveryNoteCustomerAddress;
                   doneDacs.dnResponse.customerName = stDeliveryNoteCustomerName;
                   doneDacs.dnResponse.deliveryAddress = stDeliveryNoteDeliveryAddress;
                   doneDacs.dnResponse.deliveryRecipientName = stDeliveryNoteDeliveryRecipientName;
                   doneDacs.dnResponse.issueDate = stDeliveryNoteIssueDate;
                   doneDacs.dnResponse.orderNumber = stDeliveryNoteOrderNumber;
                   doneDacs.dnResponse.supplierAddress = stDeliveryNoteSupplierAddress;
                   doneDacs.dnResponse.supplierName = stDeliveryNoteSupplierName;
                   doneDacs.dnResponse.supplierTaxNumber = stDeliveryNoteSupplierTaxNumber;
                   doneDacs.dnResponse.supplierWarehouse = stDeliveryNoteSupplierWarehouse;
                   doneDacs.dnResponse.supplierId = stDeliveryNoteSupplierId;
                   doneDacs.dnResponse.weightGross = stDeliveryNoteWeightGross;
                   for (let i = 0; i < lstJobDeliveryNoteItemItemName.Count(); i=i+1) {
                    let item = {
                    itemName: lstJobDeliveryNoteItemItemName.GetAt(i),
                    manufacturerItemNumber: lstJobDeliveryNoteItemManufacturerItemNumber.GetAt(i),
                    taxNumber: lstJobDeliveryNoteItemTaxNumber.GetAt(i),
                    amount: lstJobDeliveryNoteItemAmount.GetAt(i),
                    unit: lstJobDeliveryNoteItemUnit.GetAt(i),
                    grossWeight: lstJobDeliveryNoteItemGrossWeight.GetAt(i)
                    };
                    doneDacs.dnResponse.items.Add(item);
                   }
                    doneDacs.Send();
                }            
                else
                {
                    //Set these Anot job to DONE
                    Log(stDeliveryNoteJobId);
                    Log(stDeliveryNoteOtherJob);
                    Log("Set these Anot job to DONE");
                    db.ai_scan_jobs.UpdateMany({
                        type: "ANOT",
                        delivery_note_id: stDeliveryNoteId
                    },{
                        status: "DONE",
                        delay_time: null
                    });

                    Log("Create QA job");
                    
                    // Create QA job
                    let stQAJobId = guid.Generate().ToStringN();

                    //DEBUG Log (QA Job created)
                    Log("DEBUG");
                    Log(stQAJobId);
                    Log("QA Job created  / status -> UNCHECKED");

                    db.ai_scan_jobs.Insert({
                        id: stQAJobId,
                        type: "QA",
                        status: "UNCHECKED",
                        supplier_id: stCurrentJobSupplierId,
                        lang: stCurrentJobLanguage,
                        current_user: null,
                        delivery_note_id: stDeliveryNoteId,
                        delivery_note_work_start_date : dtlCurrentDeliveryNoteStartWorkingTime.DtlToDtdb(),
                        create_date: dtl.Now().DtlToDtdb(),
                        delay_time: null,
                        job_id_2: stDeliveryNoteJobId,
                        job_id_3: stDeliveryNoteOtherJob,
                        redo_delivery_note: stCurrentJobRedo                    
                    });

                    // Create jobs history for QA job
                    db.ai_scan_jobs_history.Insert({
                        id: stQAJobId,
                        users: null
                    });
                }
            }
        }
    }

    //Delivery note job "rejected" status
    if(dacs.dnResponse.rejected == 1)
    {
        let stDeliveryNoteId = dacs.dnResponse.guid;
        let stDeliveryNoteJobId = dacs.dnResponse.requestFileId;

        //get Delivery note job datas
        let bDeliveryNoteStatus = dacs.dnResponse.rejected == 1;
        let stDeliveryNoteStatus = bDeliveryNoteStatus ? "rejected" : "waiting";
        let stDeliveryNoteCustomerAddress = dacs.dnResponse.customerAddress;
        let stDeliveryNoteCustomerName = dacs.dnResponse.customerName;
        let stDeliveryNoteDeliveryAddress = dacs.dnResponse.deliveryAddress;
        let stDeliveryNoteDeliveryRecipientName = dacs.dnResponse.deliveryRecipientName;
        let stDeliveryNoteIssueDate = dacs.dnResponse.issueDate;
        let stDeliveryNoteDtlIssueDate = DateFrom(stDeliveryNoteIssueDate);
        let stDeliveryNoteOrderNumber = dacs.dnResponse.orderNumber;
        let stDeliveryNoteSupplierAddress = dacs.dnResponse.supplierAddress;
        let stDeliveryNoteSupplierName = dacs.dnResponse.supplierName;
        let stDeliveryNoteSupplierTaxNumber = dacs.dnResponse.supplierTaxNumber;
        let stDeliveryNoteSupplierWarehouse = dacs.dnResponse.supplierWarehouse;
        let stDeliveryNoteSupplierId = dacs.dnResponse.supplierId;
        let stDeliveryNoteWeightGross = dacs.dnResponse.weightGross;

        // Update delivery_note job
        db.ai_scan_delivery_note_job.UpdateMany({
            job_id: stDeliveryNoteJobId
        },{
            status: stDeliveryNoteStatus,
            customer_address: stDeliveryNoteCustomerAddress,
            customer_name: stDeliveryNoteCustomerName,
            delivery_address: stDeliveryNoteDeliveryAddress,
            delivery_recipient_name: stDeliveryNoteDeliveryRecipientName,
            issue_date: stDeliveryNoteIssueDate,
            dtl_issue_date: stDeliveryNoteDtlIssueDate,
            order_number: stDeliveryNoteOrderNumber,
            supplier_address: stDeliveryNoteSupplierAddress,
            supplier_name: stDeliveryNoteSupplierName,
            supplier_tax_number: stDeliveryNoteSupplierTaxNumber,
            supplier_warehouse: stDeliveryNoteSupplierWarehouse,
            supplier_id: stDeliveryNoteSupplierId,
            weight_gross: stDeliveryNoteWeightGross
        });

        // delivery_note's items
        let i = 0;
        for (let item of dacs.dnResponse.items) {
            let iDeliveryNoteItemRowCounter = i;
            let stDeliveryNoteItemItemName = item.itemName;
            let stDeliveryNoteItemManufacturerItemNumber = item.manufacturerItemNumber;
            let stDeliveryNoteItemTaxNumber = item.taxNumber;
            let stDeliveryNoteItemAmount = item.amount;
            let iDeliveryNoteItemAmount = NumberFrom(item.amount);
            let stDeliveryNoteItemUnit = item.unit;
            let stDeliveryNoteItemGrossWeight = item.grossWeight;

            // Update delivery_note job
            db.ai_scan_delivery_note_item_job.InsertOrUpdate({
                delivery_note_id: stDeliveryNoteId,
                job_id: stDeliveryNoteJobId,
                row_counter: iDeliveryNoteItemRowCounter
            },{
                item_name: stDeliveryNoteItemItemName,
                manufacturer_item_number: stDeliveryNoteItemManufacturerItemNumber,
                tax_number: stDeliveryNoteItemTaxNumber,
                amount: stDeliveryNoteItemAmount,
                amount_number: iDeliveryNoteItemAmount,
                unit: stDeliveryNoteItemUnit,
                gross_weight: stDeliveryNoteItemGrossWeight
            });

            i=i+1;
        }

        let stJobResultStatus = "REJECTED";

        //get current job's user
        let stCurrentJobUserId = "";
        let stCurrentJobUserName = "";
        let dtlCurrentJobStartTime = dtl.Now();

        let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stDeliveryNoteJobId},["user_id","job_start_time"]);

        if(lstCurrentJobUser.Count() != 0)
        {
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
        }
        else
        {
            let lstCurrentJobUserinHistory = db.ai_scan_jobs_history.ReadFields({id: stDeliveryNoteJobId},["users"]);

            Log("LastUserId");

            let stLastUsersIds = lstCurrentJobUserinHistory.GetAt(0).users;

            let iLastIndex = stLastUsersIds.LastIndexOf(",");

            let stLastUserId = stLastUsersIds.SubString(iLastIndex + 1, stLastUsersIds.Length() - (iLastIndex + 1));

            Log(stLastUserId);

            let lstCurrentUser = db.ai_scan_user.ReadFields({id: stLastUserId},["name"]);

            for(let recUser of lstCurrentUser)
            {
                stCurrentJobUserId = stLastUserId;
                stCurrentJobUserName = recUser.name;
            }
        }

        //get current job's language and supplier id and redo
        let stCurrentJobLanguage = "";
        let stCurrentJobSupplierId = "";
        let dtlCurrentDeliveryNoteStartWorkingTime = dtl.Now();
        let stCurrentJobRedo = "";

        let lstCurrentJobLanguageAndSupplierIdAndStartDate = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteJobId},["supplier_id","lang","delivery_note_work_start_date","redo_delivery_note"]);

        for(let recData of lstCurrentJobLanguageAndSupplierIdAndStartDate)
        {
            stCurrentJobSupplierId = recData.supplier_id;
            stCurrentJobLanguage = recData.lang;
            dtlCurrentDeliveryNoteStartWorkingTime = recData.delivery_note_work_start_date.DeclareAsDtl();
            stCurrentJobRedo = recData.redo_delivery_note;
        }

        //get job work time
        let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

        let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

        //create result 
        db.ai_scan_job_result.InsertOrUpdate({
            job_id: stDeliveryNoteJobId
        },{
            delivery_note_id: stDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            finish_date: dtl.Now().DtlToDtdb(),
            result: stJobResultStatus,
            job_work_time_minutes: iJobWorkTime,
            perfect_job: 0
        });

        //DEBUG Log (Get rejected ANOT Job result)
        Log("DEBUG");
        Log(stDeliveryNoteJobId);
        Log("Get rejected ANOT Job result  / status -> DONE");

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stDeliveryNoteJobId
        },{
            status : "DONE",
            current_user : stCurrentJobUserId
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stDeliveryNoteJobId, user_id : stCurrentJobUserId});

        //Remove user from ANNOT job on AI page
        let stscanId = db.ai_scan_delivery_note_job.ReadFields({job_id: stDeliveryNoteJobId},["delivery_note_id"]).SingleOrDefault().delivery_note_id;
        let stDefaultAIUser = db.ai_scan_settings.ReadFields({name: "ai_default_user"},["value"]).SingleOrDefault().value;
        
        let dacs2 = messages.AssignAITask.New();
        dacs2.assignTask.scanId = stscanId;
        dacs2.assignTask.requestFileId = stDeliveryNoteJobId;
        dacs2.assignTask.agent = stDefaultAIUser;
        //dacs2.assignTask.agent = "botond.bakai@mobilengine.com";
        dacs2.Send();

        //Get delivery note other job
        let stDeliveryNoteOtherJob = "";

        let lstDeliveryNoteJobs = db.ai_scan_delivery_note_job.ReadFields({delivery_note_id: stDeliveryNoteId},["job_id"]);

        for(let recDNJ of lstDeliveryNoteJobs)
        {
            if(recDNJ.job_id != stDeliveryNoteJobId)
            {
                stDeliveryNoteOtherJob = recDNJ.job_id;
            }
        }

        //Get delivery note other job user
        let stDeliveryNoteOtherJobUser = "";

        let lstDeliveryNoteOtherJob = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteOtherJob},["current_user"]);

        for(let recJH of lstDeliveryNoteOtherJob)
        {
            stDeliveryNoteOtherJobUser = recJH.current_user;
        }


        //If delivery note other job finished
        let lstDeliveryNoteOtherJobStatus = db.ai_scan_job_result.ReadFields({job_id: stDeliveryNoteOtherJob},["job_id","result"]);

        if(lstDeliveryNoteOtherJobStatus.Count() != 0)
        {
            let stOtherJobResultStatus = "";
            for(let recData of lstDeliveryNoteOtherJobStatus)
            {
                stOtherJobResultStatus = recData.result;
            }

            if(stJobResultStatus != "REJECTED" && stOtherJobResultStatus != "REJECTED")
            {
                //Never get here
                Log("Perfect Approved Annotations");
            }            
            else
            {
                //Set these Anot job to DONE
                Log(stDeliveryNoteJobId);
                Log(stDeliveryNoteOtherJob);
                Log("Set these Anot job to DONE");
                db.ai_scan_jobs.UpdateMany({
                    type: "ANOT",
                    delivery_note_id: stDeliveryNoteId
                },{
                    status: "DONE",
                    delay_time: null
                });

                Log("Create QA job");
                
                // Create QA job
                let stQAJobId = guid.Generate().ToStringN();

                //DEBUG Log (QA Job created)
                Log("DEBUG");
                Log(stQAJobId);
                Log("QA Job created  / status -> UNCHECKED");

                db.ai_scan_jobs.Insert({
                    id: stQAJobId,
                    type: "QA",
                    status: "UNCHECKED",
                    supplier_id: stCurrentJobSupplierId,
                    lang: stCurrentJobLanguage,
                    current_user: null,
                    delivery_note_id: stDeliveryNoteId,
                    delivery_note_work_start_date : dtlCurrentDeliveryNoteStartWorkingTime.DtlToDtdb(),
                    create_date: dtl.Now().DtlToDtdb(),
                    delay_time: null,
                    job_id_2: stDeliveryNoteJobId,
                    job_id_3: stDeliveryNoteOtherJob,
                    redo_delivery_note: stCurrentJobRedo                    
                });

                // Create jobs history for QA job
                db.ai_scan_jobs_history.Insert({
                    id: stQAJobId,
                    users: null
                });
            }
        }
    }
}