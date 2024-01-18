const vscode = require("vscode");

const globalState = {
    commandActive: true,
    statusBarItem: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
};

function activate(context) {
    let disposable = vscode.commands.registerCommand("type", async (args) => {
        const editor = vscode.window.activeTextEditor;
        let text = args.text;
        if (editor && globalState.commandActive) {
            let command = getCommandConfig(text);
            console.log(`type: ${text} -> key: minivim.command.${text} -> execute  command: ${command}`);
            if (command) {
                await vscode.commands.executeCommand(command);
            }
        } else {
            await vscode.commands.executeCommand("default:type", { text });
        }
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.minivim.activeCommandMode", () => {
            toggleCommandMode(true);
        }),
        vscode.commands.registerCommand("extension.minivim.deactiveCommandMode", () => {
            toggleCommandMode(false);
        }),
        vscode.window.onDidChangeActiveTextEditor(() => {
            toggleCommandMode(true);
        })
    );

    toggleCommandMode(true);
}

function deactivate() {}

function toggleCommandMode(active) {
    const editor = vscode.window.activeTextEditor;
    const visibleEditors = vscode.window.visibleTextEditors;

    if (!editor) {
        return;
    }

    vscode.commands.executeCommand("setContext", "extension.minivim.commandMode", active);

    globalState.commandActive = active;
    visibleEditors.forEach((e) => {
        e.options.cursorStyle = active ? vscode.TextEditorCursorStyle.Block : vscode.TextEditorCursorStyle.Line;
    });
    globalState.statusBarItem.text = active ? "-- NORMAL --" : "-- INSERT --";
    globalState.statusBarItem.show();
}

function getCommandConfig(key) {
    if (key === ".") {
        key = "dot"; // special handler .
    }
    let commandsMap = vscode.workspace.getConfiguration("minivim.command");
    let command = commandsMap[key];
    return command;
}

module.exports = {
    activate,
    deactivate
};
