//# server program ai_scan_DNScanUpdate for dacs DNScanUpdate
//# using reftab ai_scan_delivery_note;
//# using reftab ai_scan_company;
//# using reftab ai_scan_project;

{
    Log(dacs);

    //If Delivery Note not exist in ai_scan_delivery_note reftab

    let lstDeliveryNote = db.ai_scan_delivery_note.Read({delivery_note_id: dacs.dnUpdate.guid});
    let iDeliveryNoteCount = lstDeliveryNote.Count();

    if(iDeliveryNoteCount == 0)
    {
        Log("Delivery note not exist in ai_scan_delivery_note reftab");

        // Create Delivery Note row in ai_scan_delivery_note reftab
        db.ai_scan_delivery_note.Insert({
            delivery_note_id: dacs.dnUpdate.guid,
            supplier_id: "",
            guidLcomp: dacs.dnUpdate.guidLcomp,
            guidLproj: dacs.dnUpdate.guidLproj,
            lang: ""
        });

        // If guidLcomp not exist in ai_scan_company reftab
        let stLcomp = db.ai_scan_company.ReadFields({id: dacs.dnUpdate.guidLcomp},["id","name"]).SingleOrDefault();
        if(stLcomp == null)
        {
            Log("guidLcomp not exist in ai_scan_company reftab");
            db.ai_scan_company.Insert({
                id: dacs.dnUpdate.guidLcomp,
                name: dacs.dnUpdate.nameLcomp
            });
        }

        // If guidLproj not exist in ai_scan_project reftab
        let stLproj = db.ai_scan_project.ReadFields({id: dacs.dnUpdate.guidLproj},["id","name"]).SingleOrDefault();
        if(stLproj == null)
        {
            Log("guidLproj not exist in ai_scan_project reftab");
            db.ai_scan_project.Insert({
                id: dacs.dnUpdate.guidLproj,
                name: dacs.dnUpdate.nameLproj
            });
        }
    }
    else
    {
        Log("Delivery note exist in ai_scan_delivery_note reftab");
    }
}