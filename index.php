

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script src="js/jquery.3.4.1.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <!--Bootstrap css Links -->
    <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
    <style>
        body {         
         background-image: url("bg.jpg"); 
         text-align: centre;
         color: green;     
        }
        * {

        text-align: center;

        }
        h1 {
            color: red;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <h1>Enter Your Location</h1>
                <form action="backened.php" id="MyForm" method="post" onsubmit="return formSubmit();">
                <input type="text" name='cityName' placeholder='Enter City' required> <br>
                <button name='SearchNow'>Get Weather</button>
                </form>
            </div>
        </div>
        <script type='text/javascript'>
        function formSubmit() {
            $.ajax({
                type:'post',
                url:'backened.php',
                data:$('#MyForm').serialize(),
                success:function(response){
                    $('#success').html(response);  
                }
            });
            var form = document.getElementById('MyForm').reset();
            return false;
        }
    </script>
         <div id="success">

         </div>
    </div>
       
</body>
</html>