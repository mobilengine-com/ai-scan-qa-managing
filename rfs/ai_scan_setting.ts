//# server typescript program ai_scan_setting for form ai_scan_setting
//# using reftab ai_scan_user;
//# using reftab ai_scan_um_log;
//# using reftab ai_scan_beosztas_form;
//# using dacs UserIntegrationRequestDacs;

{
    // Új Item létrehozása
	let addItem = function(msg, name, value, type) {
		let item = msg.MessageRoot.Request.Items.AddNew();
		item.name = name;
		item.value = value;
		item.valueType = type;
	};
	
	// Új ItemList létrehozása
	let addItemToList = function(listItem, value, type) {
		let item = listItem.Items.AddNew();
		item.value = value;
		item.valueType = type;
	};

    //CODE

    for(let recNU of form.tblNewUser.rows)
    {
        let mapFormok = map.New();
        let mapFormPlatform = map.New();
        let platformWeb = "false";

        let stLoggedUserName = form.stLoggedUserName;

        if(stLoggedUserName === null || stLoggedUserName === "")
        {
            stLoggedUserName = "dev user";
        }

        let stId = guid.Generate().ToStringN();
        let stUserName = recNU.tbNewUser.text.Trim(" ");
        let stUserEmail = recNU.tbNewEmail.text.Trim(" ");
        let stUserRoleId = recNU.ddUserRole.selectedKey;
        let stUserRole = recNU.ddUserRole.selectedText;
        let stUserStatus = "OFFLINE";

        let stMsgGuid = guid.Generate().ToStringN();

        // Insert the user into ai_scan_user table
        db.ai_scan_user.Insert({
            id : stId,
            name : stUserName,
            email : stUserEmail,
            role : stUserRole,
            status : stUserStatus
        });
        
        // Create user creation log into ai_scan_um_log table
        db.ai_scan_um_log.Insert({
            msg_guid	: stMsgGuid,
            requester	: "System: " + stLoggedUserName,
            munkas_id	: stId,
            created		: dtl.Now().DtlToDtdb(),
            operation	: "createuser",
            state		: "running"
        });

        for(let rowMF of db.ai_scan_beosztas_form.Read(map.New())) {
			
			// Megvizsgáljuk, hogy egy formhoz különböző platformot ne lehessen megadni
			if (mapFormPlatform.ContainsKey(rowMF.form_name) && mapFormPlatform[rowMF.form_name] !== rowMF.platform) {
				Error(rowMF.form_name + " form esetén több platform is meg van adva!");
			}
			mapFormPlatform[rowMF.form_name] = rowMF.platform;
			//trace "1";
		}

        let lstMBF = db.ai_scan_beosztas_form.Read({beosztas_id : stUserRoleId.ToString(), platform: ["web"]});

        for(let rowBF of lstMBF) {
            //trace "3";            
            
            if (mapFormPlatform.ContainsKey(rowBF.form_name) && mapFormPlatform[rowBF.form_name] === "web") {
                platformWeb = "true";
                //trace "5";
            }
            
            mapFormok[rowBF.form_name] = null;
        }
        

        // Create & Send UserIntegrationRequestDacs
        let uiMsg = messages.UserIntegrationRequestDacs.New();
        uiMsg.MessageRoot.messageGuid = stMsgGuid;
        uiMsg.MessageRoot.messageName = "createuser";
            
        addItem(uiMsg, "displayName", stUserName, "string");
        addItem(uiMsg, "usern", stUserEmail, "string");
        addItem(uiMsg, "emailAddress", stUserEmail, "string");
        addItem(uiMsg, "mobileNumber", "", "string");
        addItem(uiMsg, "webformAccess", platformWeb, "bool");

        if (mapFormok.Keys().Count() !== 0 ) {
			let formListItem = uiMsg.MessageRoot.Request.ItemList.AddNew();
			formListItem.name = "forms";
			
			for (let form of mapFormok.Keys()) {
				addItemToList(formListItem, form, "string");
			}
		}

        addItem(uiMsg, "biAccess", "false", "bool");

        uiMsg.Send();
        Log("Created dacs with the following uman gateway massage id: " + stMsgGuid);
    }

    let stEditedUsers = form.stSelectedUserForEdit;

    if(stEditedUsers !== null || stEditedUsers !== "")
    {
        for(let recEU of form.tblUser.rows)
        {
            if(recEU.bSignForEdit === true)
            {
                let mapFormok = map.New();
                let mapFormPlatform = map.New();
                let platformWeb = "false";

                let stLoggedUserName = form.stLoggedUserName;

                if(stLoggedUserName === null || stLoggedUserName === "")
                {
                    stLoggedUserName = "dev user";
                }

                let stEditedId = recEU.stId;

                let lstUser = db.ai_scan_user.Read({id: stEditedId}).SingleOrDefault();
                let stEditedUserId = lstUser.user_id;

                let stEditedUserName = recEU.stEditUserName;
                let stEditUserEmail = recEU.stEditUserEmail;
                let stEditedUserRoleId = recEU.stEditUserRoleId;
                let stEditedUserRole = recEU.stEditUserRole;

                let stMsgGuid = guid.Generate().ToStringN();

                // Update the user in ai_scan_user table
                db.ai_scan_user.UpdateMany({
                    id : stEditedId
                },{
                    name : stEditedUserName,
                    role : stEditedUserRole
                });
                
                // Create alteruser log in ai_scan_um_log table
                db.ai_scan_um_log.Insert({
                    msg_guid	: stMsgGuid,
                    requester	: "System: " + stLoggedUserName,
                    munkas_id	: stEditedId,
                    created		: dtl.Now().DtlToDtdb(),
                    operation	: "alteruser",
                    state		: "running"
                });

                for(let rowMF of db.ai_scan_beosztas_form.Read(map.New())) {
                    
                    // Megvizsgáljuk, hogy egy formhoz különböző platformot ne lehessen megadni
                    if (mapFormPlatform.ContainsKey(rowMF.form_name) && mapFormPlatform[rowMF.form_name] !== rowMF.platform) {
                        Error(rowMF.form_name + " form esetén több platform is meg van adva!");
                    }
                    mapFormPlatform[rowMF.form_name] = rowMF.platform;
                    //trace "1";
                }

                let lstMBF = db.ai_scan_beosztas_form.Read({beosztas_id : stEditedUserRoleId.ToString(), platform: ["web"]});

                for(let rowBF of lstMBF) {
                    //trace "3";            
                    
                    if (mapFormPlatform.ContainsKey(rowBF.form_name) && mapFormPlatform[rowBF.form_name] === "web") {
                        platformWeb = "true";
                        //trace "5";
                    }
                    
                    mapFormok[rowBF.form_name] = null;
                }

                 // Create & Send UserIntegrationRequestDacs
                let uiMsg = messages.UserIntegrationRequestDacs.New();
                uiMsg.MessageRoot.messageGuid = stMsgGuid;
                uiMsg.MessageRoot.messageName = "alteruser";
                    
                addItem(uiMsg, "displayName", stEditedUserName, "string");
                addItem(uiMsg, "userId", stEditedUserId, "int");
                addItem(uiMsg, "usern", stEditUserEmail, "string");
                addItem(uiMsg, "emailAddress", stEditUserEmail, "string");
                addItem(uiMsg, "mobileNumber", "", "string");
                addItem(uiMsg, "webformAccess", platformWeb, "bool");
                addItem(uiMsg, "fSendEmail", "false", "bool");
		        addItem(uiMsg, "fSendSms", "false", "bool");

                if (mapFormok.Keys().Count() !== 0 ) {
                    let formListItem = uiMsg.MessageRoot.Request.ItemList.AddNew();
                    formListItem.name = "forms";
                    
                    for (let form of mapFormok.Keys()) {
                        addItemToList(formListItem, form, "string");
                    }
                }

                addItem(uiMsg, "biAccess", "false", "bool");

                Log(uiMsg);

                uiMsg.Send();
                Log("Created dacs with the following uman gateway massage id: " + stMsgGuid);
            }
        }
    }

    let stDeletedUsers = form.stSelectedUserForDelete;

    if(stDeletedUsers !== null || stDeletedUsers !== "")
    {
        for(let recDU of form.tblUser.rows)
        {
            if(recDU.bSignForDelete === true)
            {
                let stMsgGuid = guid.Generate().ToStringN();

                let stLoggedUserName = form.stLoggedUserName;

                if(stLoggedUserName === null || stLoggedUserName === "")
                {
                    stLoggedUserName = "dev user";
                }

                let stEditedId = recDU.stId;

                let lstUser = db.ai_scan_user.Read({id: stEditedId}).SingleOrDefault();
                let stEditedUserId = lstUser.user_id;

                // Create delete user log in ai_scan_um_log table
                db.ai_scan_um_log.Insert({
                    msg_guid	: stMsgGuid,
                    requester	: "System: " + stLoggedUserName,
                    munkas_id	: stEditedId,
                    created		: dtl.Now().DtlToDtdb(),
                    operation	: "deleteuser",
                    state		: "running"
                });

                // Create & Send UserIntegrationRequestDacs
                let uiMsg = messages.UserIntegrationRequestDacs.New();
                uiMsg.MessageRoot.messageGuid = stMsgGuid;
                uiMsg.MessageRoot.messageName = "deleteuser";
                addItem(uiMsg, "userId", stEditedUserId, "string");
                uiMsg.Send();
                Log("Created dacs with the following uman gateway massage id: " + stMsgGuid);
            }
        }
    }
    
}