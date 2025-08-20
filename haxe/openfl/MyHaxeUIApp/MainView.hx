package;

import haxe.ui.containers.VBox;
import haxe.ui.containers.HBox;
import haxe.ui.components.Label;
import haxe.ui.components.Button;

class MainView extends HBox {
    public function new() {
        super();

        this.percentWidth = 100;
        this.percentHeight = 100;

        var sidebar = new VBox();
        sidebar.percentHeight = 100;
        sidebar.width = 200;

        var btnDashboard = new Button();
        btnDashboard.text = "Dashboard";

        var btnUsers = new Button();
        btnUsers.text = "Users";

        var btnSettings = new Button();
        btnSettings.text = "Settings";

        sidebar.addComponent(btnDashboard);
        sidebar.addComponent(btnUsers);
        sidebar.addComponent(btnSettings);

        var content = new VBox();
        content.percentWidth = 100;
        content.percentHeight = 100;

        var label = new Label();
        label.text = "📊 Welcome to the Dashboard";

        content.addComponent(label);

        this.addComponent(sidebar);
        this.addComponent(content);
    }
}
