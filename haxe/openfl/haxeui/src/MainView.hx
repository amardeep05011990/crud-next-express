package;

import views.FormsView;
import haxe.ui.containers.VBox;
import haxe.ui.events.MouseEvent;
import haxe.ui.core.Component;

import  UsersView;
import  views.FormsView;

@:build(haxe.ui.ComponentBuilder.build("assets/main-view.xml"))
class MainView extends VBox {
    public var container:Component;

    public function new() {
        super();
    }

    override function onReady() {
        super.onReady();
        container = this.findComponent("container", Component, true);
        loadView("dashboard");
    }

    function loadView(view:String):Void {
        container.removeAllComponents();
        switch(view) {
            case "dashboard":
                container.addComponent(new DashboardView());
            case "users":
                container.addComponent(new UsersView());
            case "settings":
                container.addComponent(new SettingsView());
            case "login":
                container.addComponent(new FormsView());
        }
    }

    @:bind(dashboardBtn, MouseEvent.CLICK)
    function onDashboardClick(_) loadView("dashboard");

    @:bind(usersBtn, MouseEvent.CLICK)
    function onUsersClick(_) loadView("users");

    @:bind(settingsBtn, MouseEvent.CLICK)
    function onSettingsClick(_) loadView("settings");

    @:bind(login, MouseEvent.CLICK)
    function onLoginClick(_) loadView("login");
}


// @:build(haxe.ui.ComponentBuilder.build("assets/users-view.xml"))
// class UsersView extends VBox {}

@:build(haxe.ui.ComponentBuilder.build("assets/settings-view.xml"))
class SettingsView extends VBox {}


@:build(haxe.ui.ComponentBuilder.build("assets/dashboard-view.xml"))
class DashboardView extends VBox {}