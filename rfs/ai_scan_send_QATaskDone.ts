//#server typescript program ai_scan_send_QATaskDone for schedule 50 01 * * * first run at 2111-01-01 00:00
//#using dacs QATaskDone;
{
    Log("params");
    Log(params);
    let dacs = messages.QATaskDone.New();
    dacs.dnResponse.guid = params.guid;
    dacs.dnResponse.requestFileId = params.requestFileId;
    dacs.dnResponse.avgscoreMustHave = 0.0;
    dacs.dnResponse.avgscoreOverall = 0.0;
    dacs.dnResponse.accepted = params.accepted;
    dacs.dnResponse.rejected = params.rejected;
    dacs.dnResponse.handwritten = params.handwritten;
    dacs.Send();
}

