from linkedin_api import Linkedin
import json
import eel
import re
import datetime
import csv
eel.init('web')

@eel.expose
def send_message(data,username,password,sendContent,sendDelete):
    
    api = Linkedin(username,password)
    my_profile = api.get_user_profile()
    full_name = my_profile['miniProfile']['firstName']+" "+my_profile['miniProfile']['lastName']
    work_info = my_profile['miniProfile']['occupation']
    message_body = sendContent.replace("[[full_name]]",full_name)
    message_body = message_body.replace("[[work_info]]",work_info)
    for index in range(1,len(data)):
        message_send = message_body.replace("[[Phone Number]]",data[index][data[0].index('Phone Number')])
        message_send = message_send.replace("[[Full Name]]",data[index][data[0].index("Full Name")])
        uid = data[index][data[0].index('Linkedin Link')].replace("https://www.linkedin.com/in/","")
        res = api.send_message(message_body=message_send,recipients=(api.get_profile(uid))['profile_id'])  
        if int(sendDelete) == 1:
            conversation_id = (res['value']['conversationUrn'].replace("urn:li:fs_conversation:",""))
            api.delete_message(conversation_urn_id=conversation_id)




@eel.expose
def connection_filter(urn_id,username,password,keywords):
    keywords = keywords.split("-")
    api = Linkedin(username,password)
    connections = api.get_profile_connections(None)
    filter_list =[['Linkedin Link','Full Name','Work Info','Phone Number']]
    process = 0
    for connection in connections:
        eel.update_process_bar(process/(len(connections)))
        process = process + 1
        phone = api.get_profile_phone(connection['public_id'])
        if phone != None:
            for keyword in keywords:
                if keyword.lower() in connection['work_info'].lower():
                    filter_list.append([connection['linkedin_url'],connection['full_name'],connection['work_info'],",".join(phone),])
                    break
    with open('excel/filter_connection/'+datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")+'.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(filter_list)

@eel.expose
def auto_connect(keywords,limit,message):
    accounts =[]
    profile =[]
    report_list=[['Time','Account','Password','To','Message','Status']]
    with open ("account.txt", "r") as myfile:
        accounts = myfile.read().splitlines()
    account_index = 0
    for account in accounts:
        api = Linkedin(account.split(",")[0], account.split(",")[1])          
        if len(profile) == 0:                  
            profile = api.search_people(keywords,int(limit))
        profile_index = 0
        for item in profile:
            if profile_index % len(accounts) == account_index:
                status = api.add_connection(item['public_id'],message)
                report_list.append([datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),account.split(",")[0],account.split(",")[1],item['public_id'],message,status])
            profile_index = profile_index + 1
        account_index = account_index + 1    
    with open('excel/spam_connect/'+datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")+'.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(report_list)
@eel.expose
def update_info(first_name,last_name,info,state):
    accounts =[]
    with open ("account.txt", "r", encoding='UTF-8') as myfile:
        accounts = myfile.read().splitlines()
    for account in accounts:
        api = Linkedin(account.split(",")[0], account.split(",")[1])
        api.update_info(first_name,last_name,info,state)
    
@eel.expose
def get_account():
    with open ("account.txt", "r", encoding='UTF-8') as myfile:
        return myfile.read().splitlines()

@eel.expose
def get_messages(username,password):
    api = Linkedin(username, password)
    all_text = (api.get_conversations())
    count = 0
    for element in (all_text['elements']):
        if 'unreadCount' in element:
            count = count + (element['unreadCount'])
    return(count)        
    

    











eel.start('index.html', size=(1000, 600))