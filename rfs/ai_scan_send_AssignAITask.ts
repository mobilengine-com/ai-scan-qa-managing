//#server program ai_scan_send_AssignAITask for schedule 50 01 * * * first run at 2111-01-01 00:00
//#using dacs AssignAITask;
{
    Log("params");
    Log(params);
    let dacs = messages.AssignAITask.New();
    dacs.assignTask.scanId = params.scanId;
    dacs.assignTask.requestFileId = params.requestFileId;
    dacs.assignTask.agent = params.agent;
    dacs.Send();
}

