import asyncio
import os

import aiohttp
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message


BOT_TOKEN = os.getenv("BOT_TOKEN", "replace-me")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


class ApplicationForm(StatesGroup):
    user_id = State()
    age = State()
    monthly_income = State()
    loan_amount = State()
    loan_term_months = State()
    credit_history_years = State()
    current_debt = State()
    employment_years = State()
    dependents = State()


@dp.message(CommandStart())
async def start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(ApplicationForm.user_id)
    await message.answer("Welcome to Credit Scoring Hub.\nPlease enter your user ID.")


@dp.message(ApplicationForm.user_id)
async def process_user_id(message: Message, state: FSMContext) -> None:
    user_id = (message.text or "").strip()
    if not user_id:
        await message.answer("User ID cannot be empty.")
        return

    await state.update_data(user_id=user_id)
    await state.set_state(ApplicationForm.age)
    await message.answer("How old are you?")


@dp.message(ApplicationForm.age)
async def process_age(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(age=int(message.text or "0"))
        await state.set_state(ApplicationForm.monthly_income)
        await message.answer("What is your monthly income?")
    except ValueError:
        await message.answer("Please enter a valid integer age.")


@dp.message(ApplicationForm.monthly_income)
async def process_income(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(monthly_income=float(message.text or "0"))
        await state.set_state(ApplicationForm.loan_amount)
        await message.answer("Requested loan amount?")
    except ValueError:
        await message.answer("Please enter a valid number for monthly income.")


@dp.message(ApplicationForm.loan_amount)
async def process_loan_amount(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(loan_amount=float(message.text or "0"))
        await state.set_state(ApplicationForm.loan_term_months)
        await message.answer("Loan term in months?")
    except ValueError:
        await message.answer("Please enter a valid number for loan amount.")


@dp.message(ApplicationForm.loan_term_months)
async def process_loan_term(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(loan_term_months=int(message.text or "0"))
        await state.set_state(ApplicationForm.credit_history_years)
        await message.answer("How many years of credit history do you have?")
    except ValueError:
        await message.answer("Please enter a valid integer number of months.")


@dp.message(ApplicationForm.credit_history_years)
async def process_credit_history(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(credit_history_years=float(message.text or "0"))
        await state.set_state(ApplicationForm.current_debt)
        await message.answer("What is your current debt?")
    except ValueError:
        await message.answer("Please enter a valid number for credit history years.")


@dp.message(ApplicationForm.current_debt)
async def process_current_debt(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(current_debt=float(message.text or "0"))
        await state.set_state(ApplicationForm.employment_years)
        await message.answer("How many years have you been employed?")
    except ValueError:
        await message.answer("Please enter a valid number for current debt.")


@dp.message(ApplicationForm.employment_years)
async def process_employment_years(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(employment_years=float(message.text or "0"))
        await state.set_state(ApplicationForm.dependents)
        await message.answer("How many dependents do you have?")
    except ValueError:
        await message.answer("Please enter a valid number for employment years.")


@dp.message(ApplicationForm.dependents)
async def process_dependents(message: Message, state: FSMContext) -> None:
    try:
        await state.update_data(dependents=int(message.text or "0"))
        payload = await state.get_data()

        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/api/score", json=payload) as response:
                data = await response.json()

        status_label = "APPROVED" if data["result"] == "approved" else "REJECTED"
        await message.answer(
            f"{status_label}: {data['result'].title()}\n"
            f"Probability: {data['probability']:.2%}\n"
            f"Risk: {data['riskLevel']}\n"
            f"Recommended amount: {data['recommendedAmount']:.2f}\n"
            f"Application ID: {data['applicationId']}"
        )
        await state.clear()
    except ValueError:
        await message.answer("Please enter a valid integer for dependents.")


async def main() -> None:
    if BOT_TOKEN == "replace-me":
        raise RuntimeError("Set BOT_TOKEN before starting the bot")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
