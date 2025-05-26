package com.twl02.exchangedesktop;

//import com.twl02.exchangedesktop.api.model.ExchangeRates;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;

public class Main extends Application {
     @Override
    public void start(Stage stage) throws IOException {
         Platform.setImplicitExit(false);
        FXMLLoader fxmlLoader = new
                FXMLLoader(Main.class.getResource("parent.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 850, 675);
         stage.getIcons().add(new Image(Main.class.getResourceAsStream("/sarref-high-resolution-color-logo.png")));
        stage.setTitle("Currency Exchange");
        stage.setScene(scene);
        stage.show();
    }


    public static void main(String[] args) {
        launch();
    }
}