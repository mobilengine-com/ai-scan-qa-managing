//# server program ai_scan_gw_response for dacs AITaskResult
//# using reftab ai_scan_jobs;
//# using reftab ai_scan_delivery_note_def;
//# using reftab ai_scan_delivery_note_job;
//# using reftab ai_scan_delivery_note_item_def;
//# using reftab ai_scan_delivery_note_item_job;
//# using reftab ai_scan_user;
//# using reftab ai_scan_jobs_history;
//# using reftab ai_scan_job_inprogress;
//# using reftab ai_scan_job_result;

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

    //Delivery note "waiting" status
    if(dacs.dnResponse.accepted == 0)
    {
        let stDeliveryNoteId = dacs.dnResponse.guid;
        let bDeliveryNoteStatus = dacs.dnResponse.accepted == 1;
        let stDeliveryNoteStatus = bDeliveryNoteStatus ? "done" : "waiting";
        //let stDeliveryNoteLanguage = dacs.dnResponse.lang;
        let stDeliveryNoteAvgscoreOverall = dacs.dnResponse.avgscoreOverall;
        let stDeliveryNoteAvgscoreMustHave = dacs.dnResponse.avgscoreMustHave;
        let stDeliveryNotePdf = dacs.dnResponse.mediaIdPdf == null ? null : fileref.New(dacs.dnResponse.mediaIdPdf, 0);
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

        // Create default delivery_note
        db.ai_scan_delivery_note_def.Insert({
            delivery_note_id: stDeliveryNoteId,
            status: stDeliveryNoteStatus,
            avg_score_must_have: stDeliveryNoteAvgscoreMustHave,
            avg_score_overall: stDeliveryNoteAvgscoreOverall,
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
            weight_gross: stDeliveryNoteWeightGross,
            fileref_pdf: stDeliveryNotePdf
        });

        // Create default delivery_note's items
        let i = 0;
        for (let item of dacs.dnResponse.items) {
            let stDeliveryNoteItemId = stDeliveryNoteId;
            let iDeliveryNoteItemRowCounter = i;
            let stDeliveryNoteItemItemName = item.itemName;
            let stDeliveryNoteItemManufacturerItemNumber = item.manufacturerItemNumber;
            let stDeliveryNoteItemTaxNumber = item.taxNumber;
            let stDeliveryNoteItemAmount = item.amount;
            let iDeliveryNoteItemAmount = NumberFrom(item.amount);
            let stDeliveryNoteItemUnit = item.unit;
            let stDeliveryNoteItemGrossWeight = item.grossWeight;

            db.ai_scan_delivery_note_item_def.Insert({
                delivery_note_id: stDeliveryNoteItemId,
                row_counter: iDeliveryNoteItemRowCounter,
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

        // Create 2 anot job guid
        let stJobId = guid.Generate().ToStringN();
        let stJobId2 = guid.Generate().ToStringN();

        // Creat first job
        db.ai_scan_jobs.Insert({
            id: stJobId,
            type: "ANOT",
            status: "UNCHECKED",
            language_type: null,
            current_user: null,
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId2,
            job_id_3: null
        });

        // Creat first job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId,
            users: null
        });

        // Create delivery_note for first job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: stDeliveryNoteId,
            job_id: stJobId,
            status: stDeliveryNoteStatus,
            avg_score_must_have: stDeliveryNoteAvgscoreMustHave,
            avg_score_overall: stDeliveryNoteAvgscoreOverall,
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
            weight_gross: stDeliveryNoteWeightGross,
            fileref_pdf: stDeliveryNotePdf
        });

        // Create delivery_note's items for first job
        let i2 = 0;
        for (let item of dacs.dnResponse.items) {
            let stDeliveryNoteItemId = stDeliveryNoteId;
            let iDeliveryNoteItemRowCounter = i2;
            let stDeliveryNoteItemItemName = item.itemName;
            let stDeliveryNoteItemManufacturerItemNumber = item.manufacturerItemNumber;
            let stDeliveryNoteItemTaxNumber = item.taxNumber;
            let stDeliveryNoteItemAmount = item.amount;
            let iDeliveryNoteItemAmount = NumberFrom(item.amount);
            let stDeliveryNoteItemUnit = item.unit;
            let stDeliveryNoteItemGrossWeight = item.grossWeight;

            db.ai_scan_delivery_note_item_job.Insert({
                delivery_note_id: stDeliveryNoteItemId,
                job_id: stJobId,
                row_counter: iDeliveryNoteItemRowCounter,
                item_name: stDeliveryNoteItemItemName,
                manufacturer_item_number: stDeliveryNoteItemManufacturerItemNumber,
                tax_number: stDeliveryNoteItemTaxNumber,
                amount: stDeliveryNoteItemAmount,
                amount_number: iDeliveryNoteItemAmount,
                unit: stDeliveryNoteItemUnit,
                gross_weight: stDeliveryNoteItemGrossWeight
            });

            i2=i2+1;
        }

        // Creat second job
        db.ai_scan_jobs.Insert({
            id: stJobId2,
            type: "ANOT",
            status: "UNCHECKED",
            language_type: null,
            current_user: null,
            create_date: dtl.Now().DtlToDtdb(),
            delay_time: null,
            job_id_2: stJobId,
            job_id_3: null
        });

        // Create second job history
        db.ai_scan_jobs_history.Insert({
            id: stJobId2,
            users: null
        });

        // Create delivery_note for second job
        db.ai_scan_delivery_note_job.Insert({
            delivery_note_id: stDeliveryNoteId,
            job_id: stJobId2,
            status: stDeliveryNoteStatus,
            avg_score_must_have: stDeliveryNoteAvgscoreMustHave,
            avg_score_overall: stDeliveryNoteAvgscoreOverall,
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
            weight_gross: stDeliveryNoteWeightGross,
            fileref_pdf: stDeliveryNotePdf
        });

        // Create delivery_note's items for second job
        let i3 = 0;
        for (let item of dacs.dnResponse.items) {
            let stDeliveryNoteItemId = stDeliveryNoteId;
            let iDeliveryNoteItemRowCounter = i3;
            let stDeliveryNoteItemItemName = item.itemName;
            let stDeliveryNoteItemManufacturerItemNumber = item.manufacturerItemNumber;
            let stDeliveryNoteItemTaxNumber = item.taxNumber;
            let stDeliveryNoteItemAmount = item.amount;
            let iDeliveryNoteItemAmount = NumberFrom(item.amount);
            let stDeliveryNoteItemUnit = item.unit;
            let stDeliveryNoteItemGrossWeight = item.grossWeight;

            db.ai_scan_delivery_note_item_job.Insert({
                delivery_note_id: stDeliveryNoteItemId,
                job_id: stJobId2,
                row_counter: iDeliveryNoteItemRowCounter,
                item_name: stDeliveryNoteItemItemName,
                manufacturer_item_number: stDeliveryNoteItemManufacturerItemNumber,
                tax_number: stDeliveryNoteItemTaxNumber,
                amount: stDeliveryNoteItemAmount,
                amount_number: iDeliveryNoteItemAmount,
                unit: stDeliveryNoteItemUnit,
                gross_weight: stDeliveryNoteItemGrossWeight
            });

            i3=i3+1;
        }
    }

    //Delivery note job "done" status
    if(dacs.dnResponse.accepted == 1)
    {
        let bUserModified = true;

        let stDefaultDeliveryNoteCustomerAddress = "";
        let stDefaultDeliveryNoteCustomerName = "";
        let stDefaultDeliveryNoteDeliveryAddress = "";
        let stDefaultDeliveryNoteDeliveryRecipientName = "";
        let stDefaultDeliveryNoteIssueDate = "";
        let stDefaultDeliveryNoteDtlIssueDate = "";
        let stDefaultDeliveryNoteOrderNumber = "";
        let stDefaultDeliveryNoteSupplierAddress = "";
        let stDefaultDeliveryNoteSupplierName = "";
        let stDefaultDeliveryNoteSupplierTaxNumber = "";
        let stDefaultDeliveryNoteSupplierWarehouse = "";
        let stDefaultDeliveryNoteSupplierId = "";
        let stDefaultDeliveryNoteWeightGross = "";
        
        let stDeliveryNoteId = dacs.dnResponse.guid;
        let stDeliveryNoteJobId = dacs.dnResponse.requestFileId;

        //get Delivery note job default datas
        let lstDefaultJobDeliveryNote = db.ai_scan_delivery_note_job.Read({job_id : stDeliveryNoteJobId});

        for(let recData of lstDefaultJobDeliveryNote)
        {
            stDefaultDeliveryNoteCustomerAddress = recData.customer_address;
            stDefaultDeliveryNoteCustomerName = recData.customer_name;
            stDefaultDeliveryNoteDeliveryAddress = recData.delivery_address;
            stDefaultDeliveryNoteDeliveryRecipientName = recData.delivery_recipient_name;
            stDefaultDeliveryNoteIssueDate = recData.issue_date;
            stDefaultDeliveryNoteDtlIssueDate = DateFrom(stDefaultDeliveryNoteIssueDate);
            stDefaultDeliveryNoteOrderNumber = recData.order_number;
            stDefaultDeliveryNoteSupplierAddress = recData.supplier_address;
            stDefaultDeliveryNoteSupplierName = recData.supplier_name;
            stDefaultDeliveryNoteSupplierTaxNumber = recData.supplier_tax_number;
            stDefaultDeliveryNoteSupplierWarehouse = recData.supplier_warehouse;
            stDefaultDeliveryNoteSupplierId = recData.supplier_id;
            stDefaultDeliveryNoteWeightGross = recData.weight_gross;
        }

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

        if(stDefaultDeliveryNoteCustomerAddress == stDeliveryNoteCustomerAddress && 
            stDefaultDeliveryNoteCustomerName == stDeliveryNoteCustomerName &&
            stDefaultDeliveryNoteDeliveryAddress == stDeliveryNoteDeliveryAddress &&
            stDefaultDeliveryNoteDeliveryRecipientName == stDeliveryNoteDeliveryRecipientName &&
            stDefaultDeliveryNoteIssueDate == stDeliveryNoteIssueDate &&
            stDefaultDeliveryNoteOrderNumber == stDeliveryNoteOrderNumber &&
            stDefaultDeliveryNoteSupplierAddress == stDeliveryNoteSupplierAddress &&
            stDefaultDeliveryNoteSupplierName == stDeliveryNoteSupplierName &&
            stDefaultDeliveryNoteSupplierTaxNumber == stDeliveryNoteSupplierTaxNumber &&
            stDefaultDeliveryNoteSupplierWarehouse == stDeliveryNoteSupplierWarehouse &&
            stDefaultDeliveryNoteSupplierId == stDeliveryNoteSupplierId &&
            stDefaultDeliveryNoteWeightGross == stDeliveryNoteWeightGross)
        {
            bUserModified = false;
        }

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

        //get Delivery note job default items datas
        let lstDefaultJobDeliveryNoteItemItemName = list.New();
        let lstDefaultJobDeliveryNoteItemManufacturerItemNumber = list.New();
        let lstDefaultJobDeliveryNoteItemTaxNumber = list.New();
        let lstDefaultJobDeliveryNoteItemAmount = list.New();
        let lstDefaultJobDeliveryNoteItemNumberAmount = list.New();
        let lstDefaultJobDeliveryNoteItemUnit = list.New();
        let lstDefaultJobDeliveryNoteItemGrossWeight = list.New();

        let lstDefaultJobDeliveryNoteItems = db.ai_scan_delivery_note_item_job.Read({job_id : stDeliveryNoteJobId});

        for(let recData of lstDefaultJobDeliveryNoteItems)
        {
            lstDefaultJobDeliveryNoteItemItemName.Add(recData.item_name);
            lstDefaultJobDeliveryNoteItemManufacturerItemNumber.Add(recData.manufacturer_item_number);
            lstDefaultJobDeliveryNoteItemTaxNumber.Add(recData.tax_number);
            lstDefaultJobDeliveryNoteItemAmount.Add(recData.amount);
            lstDefaultJobDeliveryNoteItemNumberAmount.Add(NumberFrom(recData.amount));
            lstDefaultJobDeliveryNoteItemUnit.Add(recData.unit);
            lstDefaultJobDeliveryNoteItemGrossWeight.Add(recData.gross_weight);
        }

        //get Delivery note job items datas
        let lstJobDeliveryNoteItemItemName = list.New();
        let lstJobDeliveryNoteItemManufacturerItemNumber = list.New();
        let lstJobDeliveryNoteItemTaxNumber = list.New();
        let lstJobDeliveryNoteItemAmount = list.New();
        let lstJobDeliveryNoteItemNumberAmount = list.New();
        let lstJobDeliveryNoteItemUnit = list.New();
        let lstJobDeliveryNoteItemGrossWeight = list.New();

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

            lstJobDeliveryNoteItemItemName.Add(stDeliveryNoteItemItemName);
            lstJobDeliveryNoteItemManufacturerItemNumber.Add(stDeliveryNoteItemManufacturerItemNumber);
            lstJobDeliveryNoteItemTaxNumber.Add(stDeliveryNoteItemTaxNumber);
            lstJobDeliveryNoteItemAmount.Add(stDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemNumberAmount.Add(iDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemUnit.Add(stDeliveryNoteItemUnit);
            lstJobDeliveryNoteItemGrossWeight.Add(stDeliveryNoteItemGrossWeight);

            // Update delivery_note job
            db.ai_scan_delivery_note_item_job.InsertOrUpdate({
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

        let bMofifiedAnywhere = false;
        if(lstDefaultJobDeliveryNoteItems.Count() == i)
        {
            for(let l = 0;l<lstDefaultJobDeliveryNoteItems.Count();l=l+1)
            {
                if(lstDefaultJobDeliveryNoteItemItemName.GetAt(l) != lstJobDeliveryNoteItemItemName.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemManufacturerItemNumber.GetAt(l) != lstJobDeliveryNoteItemManufacturerItemNumber.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemTaxNumber.GetAt(l) != lstJobDeliveryNoteItemTaxNumber.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemAmount.GetAt(l) != lstJobDeliveryNoteItemAmount.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemNumberAmount.GetAt(l) != lstJobDeliveryNoteItemNumberAmount.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemUnit.GetAt(l) != lstJobDeliveryNoteItemUnit.GetAt(l) ||
                    lstDefaultJobDeliveryNoteItemGrossWeight.GetAt(l) != lstJobDeliveryNoteItemGrossWeight.GetAt(l))
                {
                    bMofifiedAnywhere = true;
                }
            }
        }

        if(bMofifiedAnywhere == true)
        {
            bUserModified = true;
        }

        let stJobResultStatus = "";

        //If job datas modified
        if(bUserModified == true)
        {
            stJobResultStatus = "MODIFIED_APPROVED";
        }
        else
        {
            stJobResultStatus = "APPROVED";
        }

        //get current job's user
        let stCurrentJobUserId = "";
        let stCurrentJobUserName = "";
        let dtlCurrentJobStartTime = dtl.Now();

        let lstCurrentJobUser = db.ai_scan_job_inprogress.ReadFields({job_id: stDeliveryNoteJobId},["user_id","job_start_time"]);

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

        //get current job's language
        let stCurrentJobLanguage = "";

        let lstCurrentJobLanguage = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteJobId},["language_type"]);

        for(let recJobLanguage of lstCurrentJobLanguage)
        {
            stCurrentJobLanguage = recJobLanguage.language_type;
        }

        //get job work time
        let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

        let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

        //create result 
        db.ai_scan_job_result.Insert({
            job_id: stDeliveryNoteJobId,
            delivery_note_id: stDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            result: stJobResultStatus,
            job_work_time_minutes: iJobWorkTime
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stDeliveryNoteJobId
        },{
            status : "DONE"
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stDeliveryNoteJobId, user_id : stCurrentJobUserId});

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

            if(stJobResultStatus == "APPROVED" && stOtherJobResultStatus == "APPROVED")
            {
                Log("Perfect Approved Annotations");
            }            
            else
            {
                Log("Create QA job");
                
                // Create QA job
                let stQAJobId = guid.Generate().ToStringN();

                db.ai_scan_jobs.Insert({
                    id: stQAJobId,
                    type: "QA",
                    status: "UNCHECKED",
                    language_type: stCurrentJobLanguage,
                    current_user: null,
                    create_date: dtl.Now().DtlToDtdb(),
                    delay_time: null,
                    job_id_2: stDeliveryNoteJobId,
                    job_id_3: stDeliveryNoteOtherJob                    
                });

                // Create QA delivery notes data for QA job
                let lstDefaultDeliveryNoteDatas = db.ai_scan_delivery_note_def.Read({delivery_note_id : stDeliveryNoteId});

                for(let recData of lstDefaultDeliveryNoteDatas)
                {
                    // Create delivery_note for QA job
                    db.ai_scan_delivery_note_job.Insert({
                        delivery_note_id: stDeliveryNoteId,
                        job_id: stQAJobId,
                        status: recData.status,
                        avg_score_must_have: recData.avg_score_must_have,
                        avg_score_overall: recData.avg_score_overall,
                        customer_address: recData.customer_address,
                        customer_name: recData.customer_name,
                        delivery_address: recData.delivery_address,
                        delivery_recipient_name: recData.delivery_recipient_name,
                        issue_date: recData.issue_date,
                        dtl_issue_date: recData.dtl_issue_date,
                        order_number: recData.order_number,
                        supplier_address: recData.supplier_address,
                        supplier_name: recData.supplier_name,
                        supplier_tax_number: recData.supplier_tax_number,
                        supplier_warehouse: recData.supplier_warehouse,
                        supplier_id: recData.supplier_id,
                        weight_gross: recData.weight_gross,
                        fileref_pdf: recData.fileref_pdf
                    });
                }

                // Create QA delivery notes data for QA job
                let lstDefaultDeliveryNoteItemsDatas = db.ai_scan_delivery_note_item_def.Read({delivery_note_id : stDeliveryNoteId});

                let i = 0;
                for(let recData of lstDefaultDeliveryNoteItemsDatas)
                {
                    // Create delivery_note for QA job
                    db.ai_scan_delivery_note_item_job.Insert({
                        delivery_note_id: stDeliveryNoteId,
                        job_id: stQAJobId,
                        row_counter: i,
                        item_name: recData.item_name,
                        manufacturer_item_number: recData.manufacturer_item_number,
                        tax_number: recData.tax_number,
                        amount: recData.amount,
                        amount_number: recData.amount_number,
                        unit: recData.unit,
                        gross_weight: recData.gross_weight
                    });

                    i=i+1;
                }

                // Create jobs history for QA job
                db.ai_scan_jobs_history.Insert({
                    id: stQAJobId,
                    users: null
                });
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

        //get Delivery note job items datas
        let lstJobDeliveryNoteItemItemName = list.New();
        let lstJobDeliveryNoteItemManufacturerItemNumber = list.New();
        let lstJobDeliveryNoteItemTaxNumber = list.New();
        let lstJobDeliveryNoteItemAmount = list.New();
        let lstJobDeliveryNoteItemNumberAmount = list.New();
        let lstJobDeliveryNoteItemUnit = list.New();
        let lstJobDeliveryNoteItemGrossWeight = list.New();

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

            lstJobDeliveryNoteItemItemName.Add(stDeliveryNoteItemItemName);
            lstJobDeliveryNoteItemManufacturerItemNumber.Add(stDeliveryNoteItemManufacturerItemNumber);
            lstJobDeliveryNoteItemTaxNumber.Add(stDeliveryNoteItemTaxNumber);
            lstJobDeliveryNoteItemAmount.Add(stDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemNumberAmount.Add(iDeliveryNoteItemAmount);
            lstJobDeliveryNoteItemUnit.Add(stDeliveryNoteItemUnit);
            lstJobDeliveryNoteItemGrossWeight.Add(stDeliveryNoteItemGrossWeight);

            // Update delivery_note job
            db.ai_scan_delivery_note_item_job.InsertOrUpdate({
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

        //get current job's language
        let stCurrentJobLanguage = "";

        let lstCurrentJobLanguage = db.ai_scan_jobs.ReadFields({id: stDeliveryNoteJobId},["language_type"]);

        for(let recJobLanguage of lstCurrentJobLanguage)
        {
            stCurrentJobLanguage = recJobLanguage.language_type;
        }

        //get job work time
        let tsJobWorkTime = dtl.Now().Diff(dtlCurrentJobStartTime);

        let iJobWorkTime = tsJobWorkTime.TotalMinutes.Round();

        //create result 
        db.ai_scan_job_result.Insert({
            job_id: stDeliveryNoteJobId,
            delivery_note_id: stDeliveryNoteId,
            user_id: stCurrentJobUserId,
            user_name: stCurrentJobUserName,
            result: stJobResultStatus,
            job_work_time_minutes: iJobWorkTime
        });

        // Update the job in ai_scan_jobs table
        db.ai_scan_jobs.UpdateMany({
            id : stDeliveryNoteJobId
        },{
            status : "DONE"
        });

        // Delete the job in ai_scan_job_inprogress table
        db.ai_scan_job_inprogress.DeleteMany({job_id : stDeliveryNoteJobId, user_id : stCurrentJobUserId});

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

            if(stJobResultStatus == "APPROVED" && stOtherJobResultStatus == "APPROVED")
            {
                Log("Perfect Approved Annotations");
            }            
            else
            {
                Log("Create QA job");
                
                // Create QA job
                let stQAJobId = guid.Generate().ToStringN();

                db.ai_scan_jobs.Insert({
                    id: stQAJobId,
                    type: "QA",
                    status: "UNCHECKED",
                    language_type: stCurrentJobLanguage,
                    current_user: null,
                    create_date: dtl.Now().DtlToDtdb(),
                    delay_time: null,
                    job_id_2: stDeliveryNoteJobId,
                    job_id_3: stDeliveryNoteOtherJob                    
                });

                // Create QA delivery notes data for QA job
                let lstDefaultDeliveryNoteDatas = db.ai_scan_delivery_note_def.Read({delivery_note_id : stDeliveryNoteId});

                for(let recData of lstDefaultDeliveryNoteDatas)
                {
                    // Create delivery_note for QA job
                    db.ai_scan_delivery_note_job.Insert({
                        delivery_note_id: stDeliveryNoteId,
                        job_id: stQAJobId,
                        status: recData.status,
                        avg_score_must_have: recData.avg_score_must_have,
                        avg_score_overall: recData.avg_score_overall,
                        customer_address: recData.customer_address,
                        customer_name: recData.customer_name,
                        delivery_address: recData.delivery_address,
                        delivery_recipient_name: recData.delivery_recipient_name,
                        issue_date: recData.issue_date,
                        dtl_issue_date: recData.dtl_issue_date,
                        order_number: recData.order_number,
                        supplier_address: recData.supplier_address,
                        supplier_name: recData.supplier_name,
                        supplier_tax_number: recData.supplier_tax_number,
                        supplier_warehouse: recData.supplier_warehouse,
                        supplier_id: recData.supplier_id,
                        weight_gross: recData.weight_gross,
                        fileref_pdf: recData.fileref_pdf
                    });
                }

                // Create QA delivery notes data for QA job
                let lstDefaultDeliveryNoteItemsDatas = db.ai_scan_delivery_note_item_def.Read({delivery_note_id : stDeliveryNoteId});

                let i = 0;
                for(let recData of lstDefaultDeliveryNoteItemsDatas)
                {
                    // Create delivery_note for QA job
                    db.ai_scan_delivery_note_item_job.Insert({
                        delivery_note_id: stDeliveryNoteId,
                        job_id: stQAJobId,
                        row_counter: i,
                        item_name: recData.item_name,
                        manufacturer_item_number: recData.manufacturer_item_number,
                        tax_number: recData.tax_number,
                        amount: recData.amount,
                        amount_number: recData.amount_number,
                        unit: recData.unit,
                        gross_weight: recData.gross_weight
                    });

                    i=i+1;
                }

                // Create jobs history for QA job
                db.ai_scan_jobs_history.Insert({
                    id: stQAJobId,
                    users: null
                });
            }
        }
    }
}