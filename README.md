<div align="center">
  <img width=30% src="https://github.com/user-attachments/assets/a92f27b9-5101-4725-8311-a0e6ada0edc7" alt="trip-helper-illustration">
</div>

<h1 align="center">Rocket.Chat Trip Helper</h1>

Standing in an unfamiliar place, unsure of what's going on around you, can take the fun out of exploring. The AI Travel Assistant turns that uncertainty into discovery. Just upload a photo from your trip to Rocket.Chat, and the app identifies your location, finds nearby events in real time, and delivers a clear, friendly summary. No need to search the web or guess what's nearby.

<h2>🚀 Features</h2>
<ul>
  <li>Photo-Based Discovery – Upload a photo from your surroundings to get local context and suggestions.</li>
  <li>Multi-Modal Image Understanding – Uses an advanced LLM to identify locations, landmarks, or venues from images.</li>
  <li>Live Event Fetching – Dynamically retrieves up-to-date local events and happenings using internet-connected tools.</li>
  <li>Interest-Aware Suggestions – Considers user context and preferences to surface relevant recommendations.</li>
  <li>Friendly AI Summaries – Delivers helpful, natural-language summaries of nearby events or places.</li>
  <li>Fail-Safe Responses – If the app is unsure, it avoids giving incorrect or speculative information.</li>
</ul>


<h2 >⚙️ Installation </h2>

<ol>
  <li>Have a Rocket.Chat server ready. If you don't have a server, see this <a href="https://developer.rocket.chat/v1/docs/server-environment-setup">guide</a>.</li> 
  <li>Install the Rocket.Chat Apps Engline CLI. 
  
  ``` 
    npm install -g @rocket.chat/apps-cli
  ```
  
  Verify if the CLI has been installed 
  
  ```
  rc-apps -v
# @rocket.chat/apps-cli/1.4.0 darwin-x64 node-v10.15.3
  ```
  </li>
  <li>Clone the GitHub Repository</li>
    
 ```
    git clone https://github.com/RocketChat/Apps.Trip.Helper.git
 ```
  <li>Navigate to the repository</li>
    
 ```
    cd Apps.Trip.Helper
 ```
  
  <li>Install app dependencies</li>
  
  ```
    cd trip-helper && npm install
  ```
  
  <li>To install private Rocket.Chat Apps on your server, it must be in development mode. Enable Apps development mode by navigating to <i>Administration > General > Apps</i> and turn on "Enable development mode".</li>
  
  <li>Deploy the app to the server </li>
  
  ```
  rc-apps deploy --url <server_url> --username <username> --password <password>
  ```
  
  - If you are running server locally, `server_url` is http://localhost:3000. If you are running in another port, change the 3000 to the appropriate port.
  - `username` is the username of your admin user.
  - `password` is the password of your admin user.

  <li> Open the App, by navigating to <i>Administration > Marketplace > Private Apps</i>. You should see the app listed there. Click on the App name to open the app.</li>

</ol>

## 🧑‍💻 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue.
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: adds some amazing feature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

## 📚 Resources

Here are some links to examples and documentation:

- [Rocket.Chat Apps TypeScript Definitions Documentation](https://rocketchat.github.io/Rocket.Chat.Apps-engine/)
- [Rocket.Chat Apps TypeScript Definitions Repository](https://github.com/RocketChat/Rocket.Chat.Apps-engine)
- Demo Apps
  - [DemoApp](https://github.com/RocketChat/Rocket.Chat.Demo.App)
  - [GithubApp](https://github.com/RocketChat/Apps.Github22)
- Community Forums
  - [App Requests](https://forums.rocket.chat/c/rocket-chat-apps/requests)
  - [App Guides](https://forums.rocket.chat/c/rocket-chat-apps/guides)
  - [#rocketchat-apps on Open.Rocket.Chat](https://open.rocket.chat/channel/rocketchat-apps)


