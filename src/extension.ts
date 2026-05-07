import * as path from 'path';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    State,
} from 'vscode-languageclient/node';

let client: LanguageClient;

// Panel dedicado — se crea una sola vez
const outputChannel = vscode.window.createOutputChannel('Code Assistant', 'markdown');

export function activate(context: vscode.ExtensionContext) {

    const serverOptions: ServerOptions = {
        command: 'C:\\Users\\chuch\\anaconda3\\envs\\code-assistant\\python.exe',
        args: [
            path.join('C:\\Users\\chuch\\Desktop\\Code Assistant', 'server.py')
        ],
        options: {
            env: { ...process.env }
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'python' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.py')
        },
        middleware: {},
    };

    client = new LanguageClient(
        'code-assistant',
        'Code Assistant',
        serverOptions,
        clientOptions
    );

    client.onDidChangeState((event) => {
        if (event.newState === State.Running) {
            vscode.window.showInformationMessage('Code Assistant activado! 🚀');
        }
    });

    async function runCommand(commandName: string, label: string, getArgs: () => [string, string] | null) {
        if (!client || client.state !== State.Running) {
            vscode.window.showWarningMessage('⏳ Code Assistant aún no está listo...');
            return;
        }
        const args = getArgs();
        if (!args) return;

        // Muestra spinner en el status bar
        const status = vscode.window.setStatusBarMessage(`$(sync~spin) ${label}...`);

        try {
            const response: any = await client.sendRequest('workspace/executeCommand', {
                command: commandName,
                arguments: args
            });

            status.dispose();

            if (response?.error) {
                vscode.window.showWarningMessage(response.error);
                return;
            }

            if (response?.result) {
                // Muestra en el output channel con scroll al final
                outputChannel.clear();
                outputChannel.appendLine(response.result);
                outputChannel.show(true); // true = no roba el foco del editor
            }

        } catch (e: any) {
            status.dispose();
            vscode.window.showErrorMessage(`Error: ${e.message}`);
        }
    }

    function getEditorCode(): [string, string] | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return null;
        const selected = editor.document.getText(editor.selection);
        const code = selected || editor.document.getText();
        return [editor.document.uri.toString(), code];
    }

    context.subscriptions.push(
        client,
        outputChannel,

        vscode.commands.registerCommand('code-assistant.explain', async () => {
            await runCommand('server.explain', '💡 Analizando', getEditorCode);
        }),

        vscode.commands.registerCommand('code-assistant.fixBug', async () => {
            await runCommand('server.fixBug', '🔧 Buscando bugs', getEditorCode);
        }),

        vscode.commands.registerCommand('code-assistant.generateTests', async () => {
            await runCommand('server.generateTests', '🧪 Generando tests', getEditorCode);
        }),

        vscode.commands.registerCommand('code-assistant.complete', async () => {
            await vscode.commands.executeCommand('editor.action.triggerSuggest');
        }),

        vscode.commands.registerCommand('code-assistant.generate', async () => {
            const instruction = await vscode.window.showInputBox({
                prompt: '🤖 ¿Qué código quieres generar?',
                placeHolder: 'ej: función que parsee JSON con manejo de errores'
            });
            if (!instruction) return;
            const editor = vscode.window.activeTextEditor;
            const context = editor ? editor.document.getText() : '';
            const uri = editor ? editor.document.uri.toString() : '';
            await runCommand('server.generate', '🤖 Generando código', () => [instruction, context + '|||' + uri]);
        }),

        vscode.commands.registerCommand('code-assistant.clearMemory', async () => {
            const editor = vscode.window.activeTextEditor;
            const uri = editor ? editor.document.uri.toString() : '';
            await runCommand('server.clearMemory', '🧹 Borrando memoria', () => [uri, '']);
        }),
        vscode.commands.registerCommand('code-assistant.indexWorkspace', async () => {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders) {
                vscode.window.showWarningMessage('⚠️ No hay workspace abierto');
                return;
            }
            const workspacePath = folders[0].uri.fsPath;
            await runCommand('server.indexWorkspace', '📚 Indexando workspace', () => [workspacePath, '']);
        }),
    );

    client.start().catch(err => {
        vscode.window.showErrorMessage(`❌ No se pudo iniciar el servidor: ${err.message}`);
    });
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) return undefined;
    return client.stop();
}