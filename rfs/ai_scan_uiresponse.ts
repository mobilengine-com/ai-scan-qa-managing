//# server typescript program ai_scan_uiresponse for dacs UserIntegrationResponseDacs
//# using reftab ai_scan_um_log;
//# using reftab ai_scan_user;

{
    let stDacsMsgGuid = dacs.Response.MessageGuid;
	let stDacsResultCode = dacs.Response.ResultCode;
	let stDacsMessage = dacs.Response.Message;
    let stDacsResult = null;

    let logRow = null;

	let bfindUmLog = db.ai_scan_um_log.Read({msg_guid: stDacsMsgGuid}).Count() > 0;

	if(bfindUmLog)
	{
		logRow = db.ai_scan_um_log.Read({msg_guid : stDacsMsgGuid})[0];
	}

    if(logRow.operation == "createuser")
    {
        if (dacs.Response.Results != null && dacs.Response.Results.Result.Count() == 1 && dacs.Response.Results.Result[0].Items.Count() == 1)
        {
            stDacsResult = dacs.Response.Results.Result[0].Items[0].value;
        }

        logRow.state			= "succeeded";
        logRow.processed		= dtl.Now().DtlToDtdb();
        logRow.result_code		= stDacsResultCode;
        logRow.result_message	= stDacsMessage;
        logRow.result			= stDacsResult;

        if(dacs.Response.Results == null || logRow.result_code != "0")
        {
            db.ai_scan_user.DeleteMany({id : logRow.munkas_id});

            db.ai_scan_um_log.UpdateMany({msg_guid : stDacsMsgGuid},logRow);
            
            Log("ERROR! User not created! Go to ai_scan_um_log reftab for more information!");
        }
        else
        {
            db.ai_scan_um_log.UpdateMany({msg_guid : stDacsMsgGuid},logRow);

            db.ai_scan_user.UpdateMany({id: logRow.munkas_id},{user_id : logRow.result});
        }
    }

    if(logRow.operation == "alteruser")
    {
        logRow.state			= "succeeded";
        logRow.processed		= dtl.Now().DtlToDtdb();
        logRow.result_code		= stDacsResultCode;
        logRow.result_message	= stDacsMessage;

        if(logRow.result_code == "0")
        {
            db.ai_scan_um_log.UpdateMany({msg_guid : stDacsMsgGuid},logRow);
        }
    }

    if(logRow.operation == "deleteuser")
    {
        logRow.state			= "succeeded";
        logRow.processed		= dtl.Now().DtlToDtdb();
        logRow.result_code		= stDacsResultCode;
        logRow.result_message	= stDacsMessage;

        db.ai_scan_um_log.UpdateMany({msg_guid : stDacsMsgGuid},logRow);

        if(logRow.result_code == "0")
        {
            db.ai_scan_user.DeleteMany({id : logRow.munkas_id});
        }
    }
}