package com.twl02.exchangedesktop.rates;

import com.google.gson.Gson;
import com.twl02.exchangedesktop.Authentication;
import com.twl02.exchangedesktop.Parent;
import com.twl02.exchangedesktop.api.ExchangeService;
import com.twl02.exchangedesktop.api.model.DailyRate;
//import com.twl02.exchangedesktop.api.model.DateRange;
import com.twl02.exchangedesktop.api.model.ExchangeRates;
import com.twl02.exchangedesktop.api.model.Transaction;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.scene.chart.LineChart;
import javafx.scene.chart.NumberAxis;
import javafx.scene.chart.XYChart;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Rates {
    public Label buyUsdRateLabel;
    public Label sellUsdRateLabel;
    public TextField lbpTextField;
    public TextField usdTextField;
    public TextField lbpTextFieldCalc;
    public TextField usdTextFieldCalc;
    public ToggleGroup transactionTypeCalc;
    public Label errorMessage;
    public LineChart<String,Number> rateChart;
    public Label dailyMin;
    public Label dailyMax;
    public Label dailyAvg;
    public ToggleGroup transactionType;
    public DatePicker startDatePicker;
    public DatePicker endDatePicker;
    public GridPane addTransactionGridPane;
    public ToggleGroup transactionTypeGraph;
    public RadioButton graphBuyUsdRadioButton;

//    XYChart.Series<String, Number> series;




    public void initialize() {
        graphBuyUsdRadioButton.setSelected(true);
        addTransactionGridPane.setVisible(Parent.isAuthenticated() && Parent.isTeller());
        addTransactionGridPane.setManaged(Parent.isAuthenticated()  && Parent.isTeller());
        fetchRates();
        createGraph();
        initGraph();

    }
    private void fetchRates() {

            ExchangeService.exchangeApi().getExchangeRates().enqueue(new
                 Callback<ExchangeRates>() {
                     @Override
                     public void onResponse(Call<ExchangeRates> call,
                                            Response<ExchangeRates> response) {
                         ExchangeRates exchangeRates = response.body();
                             Platform.runLater(() -> {
                            if(exchangeRates.lbpToUsd != null) {
                                buyUsdRateLabel.setText(exchangeRates.lbpToUsd.toString());
                            }
                            else{
                                buyUsdRateLabel.setText("Not Available");
                            }
                            if(exchangeRates.usdToLbp != null) {
                                sellUsdRateLabel.setText(exchangeRates.usdToLbp.toString());
                            }else{
                                sellUsdRateLabel.setText("Not Available");
                            }
                         });
                     }
                     @Override
                     public void onFailure(Call<ExchangeRates> call, Throwable
                             throwable) {
                     }
                 });


    }
    public void addTransaction(ActionEvent actionEvent) {
        String usdValue = usdTextField.getText();
        String lbpValue = lbpTextField.getText();
        if(usdValue.isEmpty() || lbpValue.isEmpty()){
            errorMessage.setText("Make sure your inputs are filled");
        } else if(!usdValue.matches("[0-9]*\\.?[0-9]+" )  || !lbpValue.matches("[0-9]*\\.?[0-9]+" )) {
            errorMessage.setText("Make sure your inputs are numbers");
        } else if (transactionType.getSelectedToggle() == null){
            errorMessage.setText("Make sure you selected a transaction type");
        } else {

            Transaction transaction = new Transaction(

                    Float.parseFloat(usdValue),
                    Float.parseFloat(lbpValue),
                    ((RadioButton)transactionType.getSelectedToggle()).getText().equals("Sell USD")

            );

            String userToken = Authentication.getInstance().getToken();
            String authHeader = userToken != null ? "Bearer " + userToken : null;
            ExchangeService.exchangeApi().addTransaction(transaction, authHeader).enqueue(new Callback<Object>() {
                @Override
                public void onResponse(Call<Object> call, Response<Object>
                        response) {
                    fetchRates();
                    Platform.runLater(() -> {
                        usdTextField.setText("");
                        lbpTextField.setText("");
                        lbpTextField.setText("");
                        errorMessage.setText("");
                    });
                }

                @Override
                public void onFailure(Call<Object> call, Throwable throwable) {
                    errorMessage.setText("Something went wrong. Please try again later");
                }
            });
        }

    }

    public void calculateAmount(ActionEvent actionEvent) {

        if (transactionTypeCalc.getSelectedToggle() == null){
            errorMessage.setText("Make sure you selected a transaction type");
        }
        else if(!((RadioButton)transactionTypeCalc.getSelectedToggle()).getText().equals("LBP to USD")){
            String usdValue = usdTextFieldCalc.getText();
            if(usdValue.isEmpty()){
                errorMessage.setText("Make sure your inputs are filled");
            } else if(!usdValue.matches("[0-9]*\\.?[0-9]+" )) {
                errorMessage.setText("Make sure your inputs are numbers");
            } else{
                lbpTextFieldCalc.setText(String.valueOf(Float.parseFloat(usdValue)*Float.parseFloat(sellUsdRateLabel.getText())));
            }
        }else{
            String lbpValue = lbpTextFieldCalc.getText();
            if(lbpValue.isEmpty()){
                errorMessage.setText("Make sure your inputs are filled");
            } else if(!lbpValue.matches("[0-9]*\\.?[0-9]+" )) {
                errorMessage.setText("Make sure your inputs are numbers");
            } else {
                usdTextFieldCalc.setText(String.valueOf(Float.parseFloat(lbpValue)/Float.parseFloat(buyUsdRateLabel.getText())));

            }

        }
    }

    public void createGraph(){
        startDatePicker.setValue(LocalDate.now().minusDays(5));
        endDatePicker.setValue(LocalDate.now());
        rateChart.setCreateSymbols(false);

        Double max = 12.0;
        NumberAxis axis = (NumberAxis) rateChart.getYAxis();
        axis.setAutoRanging(false);
        axis.setUpperBound(max);
        rateChart.setMinSize(300,450);



    }
    public void initGraph(){

        Date startDay = datePickerToDate(startDatePicker);
        Date endDay = datePickerToDate(endDatePicker);
        DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        XYChart.Series<String, Number> series = null;

        ExchangeService.exchangeApi().getDailyRates(formatter.format(startDay), formatter.format(endDay)).enqueue(new
                                                                                                                          Callback<List<DailyRate>>() {
          @Override
          public void onResponse(Call<List<DailyRate>> call,
                                 Response<List<DailyRate>> response) {


              List<DailyRate> dailyRates = response.body();
              Platform.runLater(() -> addSeriesToGraph(dailyRates));
//                     rateChart.getData().add(createSeries(response.body()));
          }
          @Override
          public void onFailure(Call<List<DailyRate>> call,
                                Throwable throwable) {
              System.out.println("We've got a problem here");
          }
      });
//        rateChart.getData().add(series);

    }

    public void updateGraph(ActionEvent actionEvent){

        Date startDay = datePickerToDate(startDatePicker);
        Date endDay = datePickerToDate(endDatePicker);
        DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        XYChart.Series<String, Number> series = null;

        ExchangeService.exchangeApi().getDailyRates(formatter.format(startDay), formatter.format(endDay)).enqueue(new
             Callback<List<DailyRate>>() {
                 @Override
                 public void onResponse(Call<List<DailyRate>> call,
                                        Response<List<DailyRate>> response) {


                     List<DailyRate> dailyRates = response.body();
                     Platform.runLater(() -> addSeriesToGraph(dailyRates));
                 }
                 @Override
                 public void onFailure(Call<List<DailyRate>> call,
                                       Throwable throwable) {
                     System.out.println("We've got a problem here");
                 }
             });

    }

    private Date datePickerToDate(DatePicker datePicker) {
        LocalDate localDate = datePicker.getValue();
        Instant instant = Instant.from(localDate.atStartOfDay(ZoneId.systemDefault()));
        return Date.from(instant);
    }

    private void addSeriesToGraph(List<DailyRate> rates) {   //XYChart.Series<String, Number>
      Boolean buyUsd = ((RadioButton)transactionTypeGraph.getSelectedToggle()).getText().equals("Buy USD");
        System.out.println(buyUsd);
        XYChart.Series<String, Number> series = new XYChart.Series<>();
        DateFormat formatter = new SimpleDateFormat("MMM dd yyyy");

        if(rates != null) {
            for (DailyRate rate : rates) {
                series.getData().add(new XYChart.Data<>(formatter.format(rate.day), buyUsd?rate.buyUsdAvg:rate.sellUsdAvg));
            }
            series.setName("Average");
            DailyRate rate = rates.get(rates.size()-1);
            setStatistics(buyUsd?rate.buyUsdMin:rate.sellUsdMin,
                    buyUsd?rate.buyUsdMax:rate.sellUsdMax,
                    buyUsd?rate.buyUsdAvg:rate.sellUsdAvg);
        }
        if(rateChart.getData().isEmpty()){
            rateChart.getData().add(series);
        }
        else{
            rateChart.getData().set(0,series);
        }
    }

    private void setStatistics(Number min, Number max, Number avg) {

        dailyMin.setText(min.toString());
        dailyMax.setText(max.toString());
        dailyAvg.setText(avg.toString());

    }
}
