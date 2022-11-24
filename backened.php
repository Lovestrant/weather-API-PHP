<?php
include_once('db.php');
    $cityId = $_POST['cityName'];

    //$apiKey = "0012978e5d4cb14a917d0d5db0829b04";
    $apiKey ="895284fb2d2c50a520ea537456963d9c";
    //$cityId = "CITY ID";
    $googleApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" . $cityId . "&lang=en&units=metric&APPID=" . $apiKey;

    //Call API
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $googleApiUrl);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_VERBOSE, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    
    curl_close($ch);
    $data = json_decode($response);
    $currentTime = time();
    
    //Getting the data from the API
    $description= $data->weather[0]->description;
    $temperature = $data->main->temp;
    $img = $data->weather[0]->icon;
    $img = 'http://openweathermap.org/img/wn/'.$img.".png";
    $timeOfDay = "";
    $timestamp = $data->dt;

    $now =  time();
    $begintime = $data->sys->sunrise;
    $endtime = $data->sys->sunset;
    if($now > $begintime && $now < $endtime){
        $timeOfDay = "DayTime";
    }else{
        $timeOfDay = "NightTime";
    }
    if($description && $temperature && $timeOfDay) {

        //Insert Record into Db
        $sql = "INSERT INTO history (description, temperature,timeOfDay,timestamp,city,img) VALUES ('$description', '$temperature','$timeOfDay','$timestamp','$cityId','$img')";
        $res = mysqli_query($con,$sql);


        //Retrieve record with similar city name
        $sql1 = "SELECT * FROM history WHERE city = '$cityId'";
        $result = mysqli_query($con, $sql1);
        $queryResults = mysqli_num_rows($result);
        if($queryResults){

            $outPut = "";
            $outPut .="
            <div class='weather-forecast'>
            <img src=$img />
        
            </div>
             <p>$description</p>
             <p>$temperature </p>
             <p>$timeOfDay</p>
             <br><br>  
             <h2>History</h2>
             ";

            while($row = mysqli_fetch_assoc($result)){
             $TheTimeOfDay = $row['timeOfDay'];
             $TheDescription = $row['description'];
             $ThTimestamp = $row['timestamp'];
             $TheTemperature = $row['temperature'];
             $TheImg = $row['img'];
             $TheTimestamp= date( "Y-m-d H:i:s" , $ThTimestamp);
             $outPut .= "
             <p>Date: $TheTimestamp ($TheTimeOfDay)</p>
             <p>$TheDescription</p>
            <p> <img src=$TheImg /></p>
             <p>$TheTemperature</p>
            ";
            }
        }

            //Display records to front end
     echo $outPut;
  
    }else{
        echo "
        <script>location.replace('NoMatch.php');</script>
        ";
        // echo "
        //  <h3>No Matching Location Found, try again</h3>
        // ";
    }


?>