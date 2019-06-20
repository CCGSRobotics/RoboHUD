#include <iostream>
#include <unordered_set>
#include <vector>
#include <string>
#include <sstream>

std::vector<std::string> arguments;
std::vector<std::string> commands;
std::unordered_set<std::string> flags;

// Returns whether a given flag has been passed to the program or not.
//
// Args:
//   - s: string, the argument which we are checking exists.
//
// Returns:
//   bool: true if s exists in the arguments list, otherwise false.
//
bool has_flag(std::string s) {
  return (flags.find(s) != flags.end());
}

void help() {
  std::cout << "Welcome to the help utility!" << std::endl;
  std::cout << "Welcome to the Robotics Package Manager, or Roman for short!" << std::endl
            << "Here are the tasks that you can perform with Roman" << std::endl
            << "* Install tools/resources created by King's Legacy - setup scripts, client, server etc" << std::endl
            << "* Update existing resources" << std::endl;
}

// Outputs the given input if the --verbose or -v flag has been passed to the program
//
// Args:
//   - s: string, the message to output if in 'verbose mode'
void verbose_log(std::string s) {
  if (has_flag("verbose") || has_flag("v")) {
    std::cout << s << std::endl;
  }
}

void install_gui_packages() {
  if (!system("npm install --cwd RoboHUD/ --prefix RoboHUD/")) {
    verbose_log("Installed client modules");
    if (!system("npm install --cwd RoboHUD/Server/ --prefix RoboHUD/Server")) {
      verbose_log("Installed server modules");
    }
  }
}

void clone_gui_repository() {
  int error = system("git clone https://github.com/CCGSRobotics/RoboHUD.git");
    
  if(!error) {
    verbose_log("Installed git repository successfully");
  } else {
    if (error == 32768) {
      // Git has returned the error code signifying that the host cannot be resolved.
      std::cerr << "Git is unable to reach the server! Check your connection to the network and try again." << std::endl;
    } //else if () || TODO: Check for invalid ssl error that is present at school due to custom SSL certs
  }
}

void install_gui() {
  std::string confirm;
  
  if (!system("[ -d RoboHUD/ ]")) {
    verbose_log("Found RoboHUD directory");
    if (!system("[ -d RoboHUD/.git ]")) {
      verbose_log("Directory seems to be a git repository");
      if (!system("git -C RoboHUD/ pull origin")) {
        verbose_log("Updated git repository");
      }
    } else {
      verbose_log("Found folder that does not seem to contain .git, backing up folder and installing");
      std::cout << "Roman has found a folder that does not seem to have a .git inside! Please enter a new folder name for the current RoboHUD directory so it can be backed up before install: ";
      std::string new_directory;
      std::cin >> new_directory;
      std::stringstream command;
      command << "[ -d " << new_directory << "/ ]";
      while (!system(command.str().c_str())) {
        std::cout << "That directory already exists! Please enter a valid name: ";
        new_directory = "";
        std::cin >> new_directory;
        command.str(std::string());
        command << "[ -d " << new_directory << "/ ]";
      }
      command.str(std::string());
      command << "mv RoboHUD/ " << new_directory;
      if (!system(command.str().c_str())) {
        clone_gui_repository();
        install_gui_packages();
      }
    }
  } else {
    verbose_log("Did not find RoboHUD directory, installing...");
    clone_gui_repository();
    install_gui_packages();
  }
}

// Generates a set of flags from the command line arguments.
//
// Note: Will ignore flags if they are not prefixed with a '-' or '--'.
//
void make_args() {
  for (std::string s : arguments) {
    int length = static_cast<int>(s.length());
    bool is_flag = false;
    if (length >= 3) {
      // process argument if it is prefixed with --
      if (s[0] == '-' && s[1] == '-') {
        is_flag = true;
        flags.insert(s.substr(2, s.length() - 2));
      }
    }
    if (length >= 2) {
      // process argument if it is prefixed with -
      is_flag = true;
      if (s[0] == '-' && s[1] != '-') {
        for (int i = 1; i < length; ++i) {
          flags.insert(std::string(1, s[i]));
        }
      }
    }

    if (s[0] != '-' && is_flag) {
      // process argument if not a flag
      commands.push_back(s);
    }
  }
}

int main(int argc, char *const argv[]) {
  for (int i = 0; i < argc; ++i) {
    arguments.push_back(std::string(argv[i]));
  }
  make_args();

  if (commands.size() == 1) {
    verbose_log("No commands specified, displaying help page");
    help();
    return 0;
  } else if (commands.size() == 2) {
    // Make the commands full of garbage values to avoid Segmentation Fault
    commands.push_back("");
  }
  if (commands[1] == "install") {
    if (commands[2] == "gui") {
      install_gui();
      return 0;
    }
  }

  return 0;
}