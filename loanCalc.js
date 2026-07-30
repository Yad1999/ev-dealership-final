function calculateLoan(){
    let Vprice = +document.getElementById("vehiclePrice").value;
    let Dpayment = +document.getElementById("downPayment").value;
    let loanInterest = +document.getElementById("loanInterest").value;
    let loanDuration = +document.getElementById("loanDur").value;

    let principal = (Vprice - Dpayment);
    let interestRate = (loanInterest/100) / 12 //interest rate per year to per month


    let result =
        principal*
        (interestRate)*Math.pow(1 + interestRate, loanDuration)/
        (Math.pow(1 + interestRate, loanDuration) - 1);

    document.getElementById("Result").innerHTML = "Your monthly interest payment is $" + result.toFixed(2) + " for " + loanDuration + " months.";

}