var app = angular.module('newlink');

app.controller('ClientController', function(wsClient, $timeout, $scope, toaster,client) {
  
  $scope.client = client;
  console.log($scope.client);
  console.log(client);
   $scope.messages={
    saveSuccess:"Guardado exitosamente",
    saveError:"Ha ocurrido un error. Favor contactar a soporte",
    deleteSuccess:"Eliminado exitosamente",
    deleteError:"Ha ocurrido un error. Favor contactar a soporte"
   }
    //$scope.client._id= "3";
  // $scope.client.name= "Santro";
  // $scope.client.address= "Gssr";
  // $scope.client.postalCode= "3424";
  // $scope.client.country= "Sweden";
  // $scope.client.phone= "834-32-34-542-323";
  // $scope.client.validity= {
  //       "start" : "2016-06-14T12:50:40.222Z",
  //       "end" : "2016-06-14T12:50:40.222Z"
  //   };
  // $scope.client.user= ["Manolin"];
  // $scope.client.themes= ["Manolin"];
  // $scope.client.interestEntities=["claro"];

// $scope.client.findById({_id:1})
//   .then(function(result){
//     console.log(result);
//   })
//   .catch(function(err){
//     console.log(err);
//   });
 $scope.save=function(){
  $scope.client.save()
  .then(function(result){
    toaster.pop('success','informacion',$scope.messages.saveSuccess);
  })
  .catch(function(err){
    toaster.pop('error','informacion',$scope.messages.saveError);
  });
}

 //   $scope.client.count({})
 //  .then(function(result){
 //    console.log(result);
 //  })
 //  .catch(function(err){
 //    console.log(err);
 //  });

 // $scope.client.find({})
 //  .then(function(result){
 //    console.log(result);
 //  })
 //  .catch(function(err){
 //    console.log(err);
 //  });

$scope.delete = function(){
  $scope.client.delete()
  .then(function(result){
    toaster.pop('success','informacion',$scope.messages.deleteSuccess);
  })
  .catch(function(err){
    toaster.pop('error','informacion',$scope.messages.deleteError);
  });
}

  // $scope.client.distinct("name")
  // .then(function(result){
  //   console.log(result);
  // })
  // .catch(function(err){
  //   console.log(err);
  // });

  

    
  
});
