Installing and running on a Windows machine

1.	The user needs to clone the code using the below command.
git clone https://github.com/YatinSirohi/RedteamAnalysisAndHypothesis.git

2.	Open the root folder of the application on a terminal. You should have access to install_packages.bat and start_servers.bat files.

3.	Install the necessary packages by running the below command.
.\install_packages.bat

4.	When you see a message saying, “Python packages have been installed” and “Node packages have been installed” on two separate terminals. Close those terminals, and run the below command to start the application:
.\start_servers.bat

The application will be launched on localhost:3000, with flask servers running on terminals.

Installing and running in Linux machine

1.	Step 1 is the same.

2.	Install a gnome-terminal using the command:
Sudo apt install gnome-terminal

3.	Open the root folder of the application on a terminal. You should have access to install_packages.sh and start_servers.sh files.

4.	Install the necessary packages by running the below command.
./install_packages.sh

5.	When you see a message saying, “All packages installed successfully”, close the terminal and run the below command to start the application:
./start_servers.sh

Troubleshooting
If you face any error saying any Python module is not reachable, please try changing the Python interpreter.
