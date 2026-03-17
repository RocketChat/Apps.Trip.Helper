export const de = {
    Message_Sent_By_User:
        "Nachricht gesendet von Benutzer __username__: __text__",
    Processing_Image: "Verarbeite dein Bild, bitte warte einen Moment ...",
    Image_Validation_Successful: "Bildvalidierung erfolgreich.",
    Valid_Image_Received:
        "Gültiges Bild erhalten. Verarbeite deine Position ...",
    Failed_To_Process_Image: "Fehler beim Verarbeiten deines Bildes:",
    Image_Validation_Failed: "Bildvalidierung fehlgeschlagen.",
    Uploaded_Image_Not_Valid:
        "Das hochgeladene Bild ist nicht gültig. Bitte versuche es mit einem anderen Bild erneut.",
    Location_Detected: "Standort erkannt",
    App_User_Not_Found: "App-Benutzer nicht gefunden.",
    App_User_Not_Found_Try_Later:
        "App-Benutzer nicht gefunden. Bitte versuche es später erneut.",
    Provide_Valid_Location: "Bitte gib zuerst einen gültigen Standort an.",
    Location_Set:
        "Hey __username__, dein Standort ist gesetzt auf: __location__. __text__",
    Failed_To_Process_Message:
        "Fehler beim Verarbeiten deiner Nachricht. Bitte versuche es später erneut.",
    Trip_Channel_Created:
        "Dein Reisekanal __channelname__ wurde erfolgreich erstellt! Genieße deine Reise! 🚀",
    Provide_Trip_Channel_Name:
        "Bitte gib einen Namen für den Reisekanal an. Verwendung: `/trip create <kanal-name>`",
    Model_Selection: "Modellauswahl",
    AI_Model_Used_For_Inference: "KI-Modell für die Inferenz verwenden.",
    API_Key_For_LLM: "API-Schlüssel für den Zugriff auf das LLM-Modell.",
    API_Endpoint_For_Inference: "API-Endpunkt für die Inferenz verwenden.",
    Welcome_User:
        "Hey __username__ 👋, ich bin dein Reisehelfer! \n __welcomeMessage__",
    Room_Does_Not_Exist: "Raum existiert nicht",
    API_Configuration_Missing:
        "API-Konfiguration fehlt. Bitte kontaktiere den Administrator.",
    Failed_To_Process_Image_With_Error:
        "Fehler beim Verarbeiten deines Bildes: __error__, Kontaktiere den Administrator.",
    Failed_To_Send_Message: "Fehler beim Senden der Nachricht: __error__",
    Enjoying_Trip_At_Location:
        "Oh! Du genießt deine Reise in __location__. Möchtest du diesen Standort verwenden?",
    No_Location_Found_To_Confirm: "Kein Standort zum Bestätigen gefunden.",
    Unable_To_Store_Location_System_Error:
        "Kann deinen Standort aufgrund eines Systemfehlers nicht speichern. Bitte versuche es später erneut.",
    Cannot_Detect_Location:
        "Wir können deinen Standort nicht automatisch erkennen. Bitte teile deinen Standort mit uns, um fortzufahren. Wir werden deine Geräte-IP-Adresse verwenden, um deinen Standort zu ermitteln.",
    Location_Required_To_Continue:
        "Du weißt, dass wir dir ohne deinen Standort nicht helfen können, oder? Bitte gib deinen Standort an, um fortzufahren.",
    Location_Coordinates:
        "Deine Standortkoordinaten: __latitude__, __longitude__",
    Share_Location: "Standort teilen",
    Not_Now: "Nicht jetzt",
    Unable_To_Retrieve_Location_From_IP:
        "Kann Standort nicht von der IP-Adresse abrufen.",
    Your_Location_Display: "Dein Standort: __displayName__",
    Enter_Your_Location: "Gib deinen Standort ein",
    Submit: "Bestätigen",
    Close: "Schließen",
    Select_Your_Location: "Wähle deinen Standort",
    Room_Name_Already_Exists:
        "Raumname '__roomName__' existiert bereits. Du kannst mit diesem Raum fortfahren.",
    Location_Stored_Successfully:
        "Dein Standort wurde gespeichert als: __location__. Du kannst jetzt nach reisebezogenen Informationen fragen!",
    Scheduled_Reminder_Message:
        ":loudspeaker: Du wolltest, dass ich dich an die Nachricht erinnere \n __message__",
    Google_Search_Config_Missing:
        "Der Google-Custom-Search-API-Schlüssel oder die SearchEngineID fehlt.",
    Location_Not_Set_Info:
        "Bitte setze zuerst deinen Standort mit dem Befehl `/trip location`. Danach besorgen wir lokale Informationen für dich.",
    Fetching_Local_Info: "Hole lokale Informationen für __location__...",
    Error_Fetching_Category:
        "Fehler beim Abrufen der Daten für Kategorie \"__category__\": __error__",
    Processing_Local_Events:
        "Verarbeite __count__ lokale Events in __location__...",
    No_Relevant_Events: "Keine relevanten Events in deiner Umgebung gefunden.",
    Failed_To_Store_Event_Details:
        "Ereignisdaten konnten nicht gespeichert werden. Bitte versuche es später erneut.",
    Set_Reminder_Primary:
        "Hier sind einige Events in __location__. Du kannst für jedes unten über die Schaltfläche eine Erinnerung setzen. \n\n Möchtest du eine Erinnerung für: \"__event__\" setzen?",
    Set_Reminder_Generic:
        "Möchtest du eine Erinnerung für: \"__event__\" setzen?",
    No_Local_Info: "Keine lokalen Informationen für diesen Standort gefunden.",
    Location_Not_Set_Emergency:
        "Bitte setze zuerst deinen Standort mit dem Befehl `/trip location`. Dann kann ich Notfallwarnungen abrufen.",
    Google_Api_Key_Missing:
        "Google-API-Schlüssel fehlt. Bitte konfiguriere ihn, um Notfallwarnungen abzurufen.",
    Checking_Emergency_Alerts:
        "Prüfe Notfallwarnungen für __location__...",
    No_Emergency_Alerts: "Derzeit gibt es keine Notfallwarnungen für deine Region.",
    Emergency_Warning_Line: "Warnung: __title__\n__description__\n\n",
    Emergency_Default_Title: "Notfallwarnung",
    Emergency_Alerts_Header:
        "Notfallwarnungen für __location__:\n\n__alerts__",
    Error_Fetching_Emergency:
        "Fehler beim Abrufen der Notfallwarnungen: __error__",
    Helper_Message:
        "Hallo __name__ 👋, ich bin dein Trip Helper!\n        • nutze `/trip help`, um Hilfe zu erhalten   \n        • nutze `/trip create`, um einen separaten Reisekanal zu erstellen\n        • nutze `/trip reminder`, um eine Erinnerung für deine Reise zu setzen\n        • nutze `/trip location`, um deinen Standort mit dem Reisekanal zu teilen\n        • nutze `/trip info`, um Infos zu deinem aktuellen Standort zu erhalten",
    Button_Set_Reminder: "Erinnerung setzen",
    Button_Yes: "Ja",
    Button_No: "Nein",
    Default_Welcome:
        "Hallo __name__ 👋, ich bin dein Trip-Helper-Bot. Wie kann ich dir helfen?",
    Button_Show_Location: "Standort anzeigen",
    Button_Show_Info: "Infos anzeigen",
    Button_Need_More: "Mehr Optionen",
    Reminder_Helper_Text:
        "Ich kann dir helfen, eine Erinnerung zu erstellen! Klicke unten, um loszulegen.",
    Button_Create_Reminder: "Erinnerung erstellen",
    Channel_Helper_Text:
        "Ich kann dir helfen, einen Kanal zu erstellen! Klicke unten, um ihn einzurichten.",
    Button_Create_Channel: "Kanal namens __channel__ erstellen",
    Failed_To_Create_Channel:
        "Der Kanalname konnte nicht erstellt oder gespeichert werden. Bitte versuche es später erneut.",
    Trip_Channel_Already_Exists:
        "Ein Reisekanal namens '__channel__' existiert bereits. Nutze dort unsere Funktionen! 🚀",
    Failed_To_Create_Trip_Channel:
        "Reisekanal __channel__ konnte nicht erstellt werden. Bitte versuche einen anderen Namen.",
    Current_Location_Message:
        "Dein aktueller Standort ist __location__. Möchtest du ihn ändern? \n Wir verwenden die **IP-Adresse** deines Geräts, um deinen Standort zu ermitteln.",
    Share_Location_Request:
        "Teile deinen Standort mit uns. Wir verwenden die **IP-Adresse** deines Geräts, um ihn zu bestimmen.",
    Invalid_Command_Message:
        "**Ungültiger Unterbefehl**: \"__command__\". Tippe `/trip help` für verfügbare Befehle.",
    Channel_Name_Invalid: "Kanalname ist ungültig.",
    Form_Fix_Errors: "__name__, bitte behebe folgende Fehler: __errors__",
    Failed_To_Schedule_Reminder:
        "Die Erinnerung konnte nicht geplant werden. Bitte versuche es später erneut.",
    Reminder_Set_For: "Erinnerung für **__when__** gesetzt: **__message__**",
    Validation_Message_Required: "Nachricht darf nicht leer sein.",
    Validation_Time_Required: "Zeit darf nicht leer sein.",
    Validation_Date_Required: "Datum darf nicht leer sein.",
    Validation_Time_In_Future:
        "Datum und Uhrzeit müssen in der Zukunft liegen.",
    Location_Not_Set_Command:
        "Bitte gib zuerst einen gültigen Standort an. Nutze den Befehl `/trip location`, oder sende deine IP-Adresse bzw. Koordinaten im Format `Breite, Länge` oder `Grad Minuten Sekunden N/S E/W`.",
    Location_Detected_Through_IP:
        "Standort über deine IP-Adresse erkannt. Bitte warte, während wir ihn verarbeiten.",
    Install_Preview_Title:
        "[**Trip Helper App**](https://github.com/RocketChat/Apps.Trip.Helper/)",
    Install_Preview_Description: "**Installiert und startklar auf deinem Server!**",
    Install_Preview_Context:
        "[**Support-Seite**](https://github.com/RocketChat/Apps.Trip.Helper/issues)",
    Install_Welcome_Message:
        "Der Einstieg ist kinderleicht! Öffne einfach die App-Einstellungen und trage die benötigten Zugangsdaten ein.\n Danach kannst du direkt loslegen: Lade deine Bilder hoch und lass dir Details anzeigen.\n Für weitere Funktionen tippe `/trip help`, um die komplette Befehlsliste zu sehen.\n Lass uns gemeinsam deine Produktivität und Zusammenarbeit verbessern. Viel Spaß auf der Reise!\n \n Danke, dass du die `Trip Helper App` nutzt.",
    Reminder_Date_Label: "Erinnerungsdatum",
    Reminder_Time_Label: "Erinnerungszeit",
    Reminder_Message_Label: "Nachricht",
    Reminder_Message_Placeholder: "Happy Hour beginnt! 🎉 🍣",
    Reminder_Date_Placeholder: "JJJJ-MM-TT",
    Reminder_Time_Placeholder: "HH:MM",
    Reminder_Modal_Title: "Erinnerung erstellen",
    Reminder_Submit_Button: "Bestätigen",
    Reminder_Close_Button: "Abbrechen",
    Reminder_Default_Event_Message: "Erinnere mich an __event__",
    Location_Label: "Standort",
    Room_Name_Duplicate_Error:
        "Raumname '__roomName__' existiert bereits. Bitte wähle einen anderen Namen.",
};
