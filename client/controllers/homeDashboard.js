var app = angular.module('porsche');

app.controller('HomeDashboardController', function($scope) {

  $scope.files = [{
    owner: {
      _id: 1,
      fullName: 'Andrés Encarnación Ortiz'
    },
    vehicle: {
      brand: 'Porsche',
      model: '911 Turbo'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 55
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Adriel Gómez Hernández'
    },
    vehicle: {
      brand: 'Porsche',
      model: '718 Cayman S'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Cambio Aceite de Transmisión',
      _id: 1,
      progress: 100
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Gustavo Moya Torres'
    },
    vehicle: {
      brand: 'Porsche',
      model: '911 Carrera 4'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Lavado de Vehiculo',
      _id: 2,
      progress: 100
    }, {
      date: new Date(),
      description: 'Reparación de Motor',
      _id: 3,
      progress: 37
    }, {
      date: new Date(),
      description: 'Cambio Aceite de Motor',
      _id: 4,
      progress: 70
    },  {
      date: new Date(),
      description: 'Cambio de Frenos',
      _id: 3,
      progress: 78
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Franchesca Guzman Santana'
    },
    vehicle: {
      brand: 'Porsche',
      model: '911 Targa 4GTS'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Cambio Bomba Hidráulica',
      _id: 3,
      progress: 4
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Luis Manuel García'
    },
    vehicle: {
      brand: 'Porsche',
      model: '911 R'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Cambio de Aceite de Motor',
      _id: 5,
      progress: 26
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Gael Abreu Ortiz'
    },
    vehicle: {
      brand: 'Porsche',
      model: 'Panamera Diesel'
    },
    phases: [{
      date: new Date(),
      description: 'Lavado de Vehiculo',
      _id: 1,
      progress: 39
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Indira Moya Torres'
    },
    vehicle: {
      brand: 'Porsche',
      model: '718 Cayman S'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 65
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Alan Brito Paredes'
    },
    vehicle: {
      brand: 'Porsche',
      model: 'Panamera S'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Salida de Vehículo',
      _id: 1,
      progress: 100
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Raquel Rosario De Jesus'
    },
    vehicle: {
      brand: 'Porsche',
      model: 'Cayenne'
    },
    phases: [{
      date: new Date(),
      description: 'Revisión de Vehiculo',
      _id: 1,
      progress: 45
    }, {
      date: new Date(),
      description: 'Cambio de Frenos',
      _id: 1,
      progress: 87
    }]
  }, {
    owner: {
      _id: 1,
      fullName: 'Marcos Brito Pascal'
    },
    vehicle: {
      brand: 'Porsche',
      model: 'Cayenne Turbo'
    },
    phases: [{
      date: new Date(),
      description: 'Pintura de Vehículo',
      _id: 1,
      progress: 100
    }, {
      date: new Date(),
      description: 'Lavado de Vehiculo',
      _id: 1,
      progress: 98
    }]
  }, ];

  $scope.getLastPhase = function(file) {
    return Lazy(file.phases).last();
  };

  $scope.selectFile = function (file) {
    $scope.file = file;
  };

  $scope.selectFile($scope.files[2]);

});
