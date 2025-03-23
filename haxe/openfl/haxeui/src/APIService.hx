package;

class APIService {
    public static var users:Array<{ id:Int, name:String, email:String }> = [
        { id: 1, name: "John", email: "john@example.com" },
        { id: 2, name: "Jane", email: "jane@example.com" }
    ];
    static var counter = 3;

    public static function getUsers() {
        return users;
    }

    public static function saveUser(name:String, email:String) {
        users.push({ id: counter++, name: name, email: email });
    }

    public static function deleteUser(id:Int) {
        users = users.filter(u -> u.id != id);
    }
}
