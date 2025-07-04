package;

import haxe.ui.containers.VBox;
import haxe.ui.components.TextField;
import haxe.ui.components.Label;
import haxe.ui.components.Button;
import haxe.ui.events.MouseEvent;

@:build(haxe.ui.ComponentBuilder.build("assets/users-view.xml"))
class UsersView extends VBox {
    public function new() {
        super();
        
        var saveBtn = this.findComponent("saveBtn", Button);
        var clearBtn = this.findComponent("clearBtn", Button);
        var nameField = this.findComponent("nameField", TextField);
        var emailField = this.findComponent("emailField", TextField);
        var statusLabel = this.findComponent("statusLabel", Label);

        saveBtn.onClick = function(_) {
            var name = nameField.text;
            var email = emailField.text;

            if (name != "" && email != "") {
                // 🧠 Simulate saving user
                trace('👤 Saving user: $name <$email>');
                statusLabel.text = "User saved!";
            } else {
                statusLabel.text = "❌ Name and Email required!";
                statusLabel.style.color = 0xff0000;
            }
        }

        clearBtn.onClick = function(_) {
            nameField.text = "";
            emailField.text = "";
            statusLabel.text = "";
        }
    }
}
