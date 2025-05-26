package com.twl02.exchangedesktop.register;

import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.OnPageCompleteListener;
import com.twl02.exchangedesktop.PageCompleter;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.Token;
import com.twl02.exchangedesktop.api.model.User;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.scene.control.CheckBox;
import javafx.scene.control.TextField;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Register implements PageCompleter {
    public TextField usernameTextField;
    public TextField passwordTextField;
    public CheckBox tellerCheckBox;
    private OnPageCompleteListener onPageCompleteListener;

    public void register(ActionEvent actionEvent) {
        System.out.println(tellerCheckBox.isSelected());
        User user = new User(usernameTextField.getText(),
                passwordTextField.getText(), tellerCheckBox.isSelected());
        ExchangeService.exchangeApi().addUser(user).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User>
                    response) {

                ExchangeService.exchangeApi().authenticate(user).enqueue(new Callback<Token>() {
                    @Override
                    public void onResponse(Call<Token> call,
                                        Response<Token> response) {

                     Authentication.getInstance().saveToken(response.body().getToken());
                    }

                    @Override
                    public void onFailure(Call<Token> call, Throwable
                         throwable) {
                    }
                });
                Platform.runLater(() -> {
                    onPageCompleteListener.onPageCompleted();
                });
            }

            @Override
            public void onFailure(Call<User> call, Throwable throwable) {
            }
        });
    }

    @Override
    public void setOnPageCompleteListener(OnPageCompleteListener onPageCompleteListener) {
        this.onPageCompleteListener = onPageCompleteListener;
    }
}
