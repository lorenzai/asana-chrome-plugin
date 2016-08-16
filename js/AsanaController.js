asanaModule.controller("userController", function ($scope, AsanaGateway) {
    $scope.loggedIn = Asana.isLoggedIn();

    AsanaGateway.getUserData(function (response) {
        $scope.user = response;
    });

    $scope.createTab = function (url) {
        chrome.tabs.create({url: url}, function () {
            window.close();
        });
    }
});

asanaModule.controller("createTaskController", function ($scope, AsanaGateway, $timeout) {
    $scope.loggedIn = Asana.isLoggedIn();
    $scope.workspaceNotSelected = true;

    $scope.selectedWorkspace = {id: undefined};
    $scope.selectedProject = {list: []};
    $scope.selectedUser = {id: undefined};
    $scope.selectedTags = {};
    $scope.selectedTags.list = [];

    $scope.taskCreationStatus = {
        success: false,
        message: "",
        show: false
    };
    $scope.onWorkspaceSelect = function (item, model) {
        $scope.selectedWorkspaceId = $scope.selectedWorkspace.id.id;
        $scope.clearFields();
        $scope.workspaceNotSelected = false;

        AsanaGateway.getWorkspaceTags(function (response) {
            $scope.tags = response;
        }, null, {workspace_id: $scope.selectedWorkspaceId});

        AsanaGateway.getWorkspaceUsers(function (response) {
            $scope.users = response;
        }, null, {workspace_id: $scope.selectedWorkspaceId});

        AsanaGateway.getWorkspaceProjects(function (response) {
            $scope.projects = response;
        }, null, {workspace_id: $scope.selectedWorkspaceId});
    };

    $scope.createTask = function () {
        var options = {data: {}};
        options.data.workspace = $scope.selectedWorkspaceId;
        if($scope.isDefined($scope.selectedUser.id))
            options.data.assignee = $scope.selectedUser.id.id;
        if($scope.isDefined($scope.dueDate.date))
            options.data.due_at = $scope.dueDate.date;

        var projectList = $scope.selectedProject.list;
        var projectIds = projectList.map(function (element) {
            return element.id;
        });
        if(projectIds.length > 0){
            options.data.projects = projectIds;
        }

        var taglist = $scope.selectedTags.list;
        var tags = taglist.map(function (element) {
            return element.id;
        });
        if(tags.length > 0){
            options.data.tags = tags;
        }

        options.data.name = $scope.taskName;
        options.data.notes = $scope.taskNotes;

        console.log("Creating task with parameters: " + JSON.stringify(options));
        AsanaGateway.createTask(function (response) {
            console.log("Success: creating task: " + response);
            $scope.selectedWorkspace = {id: undefined};
            $scope.clearFields();

            $scope.taskCreationStatus = {
                success: true,
                message: "Task created",
                show: true
            };
            $timeout(function () {
                $scope.taskCreationStatus.show = false;
            }, 5000);
        }, function (response) {
            console.log("Error: creating task: " + JSON.stringify(response));
            $scope.taskCreationStatus = {
                success: false,
                message: "Failed to create task", //@todo error message
                show: true
            };
            $timeout(function () {
                $scope.taskCreationStatus.show = false;
            }, 5000);
        }, options);
    };

    AsanaGateway.getWorkspaces(function (response) {
        $scope.workspaces = response;
    });

    // date picker
    $scope.dueDate = {
        /*date: new Date()*/
    };

    $scope.clearFields = function () {
        $scope.selectedProject = { list: [] };
        $scope.selectedUser = {id: undefined};
        $scope.selectedTags = {list: []};
        $scope.taskName = undefined;
        $scope.taskNotes = undefined;
        $scope.dueDate = undefined;
    };

    $scope.isDefined = function (param) {
        return typeof param != 'undefined';
    };
});

asanaModule.controller("todoController", function ($scope, AsanaGateway) {
    $scope.loggedIn = Asana.isLoggedIn();
});

