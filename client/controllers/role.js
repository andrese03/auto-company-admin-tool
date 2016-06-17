var app = angular.module('porsche');

app.controller('roleCtrl', function ($scope, options, wsOption, wsRole, roles, toaster, dialogs){

	$scope.options = options.data;

	$scope.check = true;
	$scope.roles = roles.data;

	$scope.role = $scope.roles[0];
	var roleCopy = angular.copy($scope.role);
	var rol = new wsRole();


	var message = {
    saveError: "Cambios no fueron guardados",
    save: "Cambios guardados exitosamente",
    warningRoleChange: "No ha guardado los cambios. ¿Está seguro de que quiere cambiar de rol sin guardar?"
  };

	$scope.saveChanges = function () {
		console.log($scope.role)
    $scope.role.save().then(function (res) {
      toaster.pop('success', 'Rol', message.save);
      roleCopy = angular.copy($scope.role);
    }, function (err) {
      toaster.pop('warning', 'Rol', message.saveError);
    })
  };



	$scope.checkIn = function (rol, opts){
		return (Lazy(rol.options).findWhere({
      _id: opts._id
    }));
	};

	$scope.updateCheck = function (opts){
		var i = 0;

	    do {
	      if ($scope.role.options[0]) {
	        if ($scope.role.options[i] && $scope.role.options[i]._id === opts._id) {
	          var option = angular.copy($scope.role.options[i]);
	          $scope.role.options.splice(i, 1);
	          var reduced = Lazy($scope.role.options).reject(opts).toArray();
	          $scope.role.options = reduced;
	          break;
	        } else if (i == $scope.role.options.length - 1) {
	          $scope.role.options.push(opts);
	          break;
	        }
	      } else {
	        $scope.role.options.push(opts);
	        break;
	      }
	      i++;

	    } while (i < $scope.role.options.length);	};

	$scope.setRol = function (role) {
    if (!angular.equals(roleCopy, $scope.role)) {
      var dialogChange = dialogs.confirm('Advertencia', message.warningRoleChange);
      dialogChange.result.then(function (btn) {
        rol.find({}).then(function (res) {

          $scope.roles = res.data;
        })
        $scope.role = role;
        roleCopy = angular.copy($scope.role);
      })
    } else {
	      $scope.role = role;
	      roleCopy = angular.copy($scope.role);
	    }
	}
});
