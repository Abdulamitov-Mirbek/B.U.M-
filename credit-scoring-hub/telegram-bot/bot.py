import asyncio
import logging
import os
from typing import Any

import aiohttp
from aiogram import Bot, Dispatcher
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("credit_scoring_bot")

BOT_TOKEN = os.getenv("BOT_TOKEN", "replace-me")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080").rstrip("/")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


class ApplicationForm(StatesGroup):
    language = State()
    user_id = State()
    age = State()
    monthly_income = State()
    loan_amount = State()
    loan_term_months = State()
    credit_history_years = State()
    current_debt = State()
    employment_years = State()
    dependents = State()


TEXTS = {
    "eng": {
        "select_language": "Select your language / Выберите язык / Тилинизди тандаңыз:",
        "start": (
            "Credit Scoring Bot\n\n"
            "I will ask a few questions and send the application to the scoring service.\n"
            "Use /cancel to stop the current application."
        ),
        "cancelled": "Current application was cancelled.",
        "no_active_form": "There is no active application form right now.",
        "ask_user_id": "Enter applicant ID.",
        "ask_age": "Enter age in full years. Example: 29",
        "ask_income": "Enter monthly income. Example: 12000",
        "ask_loan_amount": "Enter requested loan amount. Example: 25000",
        "ask_loan_term": "Enter loan term in months. Example: 24",
        "ask_credit_history": "Enter credit history in years. Example: 6",
        "ask_current_debt": "Enter current debt. Example: 1800",
        "ask_employment_years": "Enter employment years. Example: 4",
        "ask_dependents": "Enter number of dependents. Example: 1",
        "processing": "Processing your application, please wait...",
        "backend_error": "The backend could not process the application.",
        "network_error": "Could not connect to the backend service.",
        "invalid_user_id": "Applicant ID must contain from 2 to 50 characters.",
        "invalid_age": "Age must be an integer from 18 to 120.",
        "invalid_income": "Monthly income must be a number greater than or equal to 100.",
        "invalid_loan_amount": "Loan amount must be a number from 500 to 500000.",
        "invalid_loan_term": "Loan term must be an integer from 3 to 360.",
        "invalid_credit_history": "Credit history must be a number from 0 to 50.",
        "invalid_current_debt": "Current debt must be a number from 0 to 10000000.",
        "invalid_employment_years": "Employment years must be a number from 0 to 60.",
        "invalid_dependents": "Dependents must be an integer from 0 to 20.",
        "result_header": "Scoring result",
        "result": "Result",
        "probability": "Probability",
        "risk": "Risk",
        "recommended_amount": "Recommended amount",
        "application_id": "Application ID",
        "help": (
            "/start - start a new application\n"
            "/cancel - cancel current application\n"
            "/help - show this help"
        ),
    },
    "rus": {
        "select_language": "Выберите язык:",
        "start": (
            "Бот скоринга кредитов\n\n"
            "Я задам несколько вопросов и отправлю заявку на сервис оценки.\n"
            "Используйте /cancel для отмены текущей заявки."
        ),
        "cancelled": "Текущая заявка была отменена.",
        "no_active_form": "В данный момент нет активной формы заявки.",
        "ask_user_id": "Введите ID заявителя.",
        "ask_age": "Введите возраст в полных годах. Пример: 29",
        "ask_income": "Введите ежемесячный доход. Пример: 12000",
        "ask_loan_amount": "Введите запрашиваемую сумму кредита. Пример: 25000",
        "ask_loan_term": "Введите срок кредита в месяцах. Пример: 24",
        "ask_credit_history": "Введите кредитную историю в годах. Пример: 6",
        "ask_current_debt": "Введите текущий долг. Пример: 1800",
        "ask_employment_years": "Введите стаж работы. Пример: 4",
        "ask_dependents": "Введите количество иждивенцев. Пример: 1",
        "processing": "Обработка вашей заявки, пожалуйста, подождите...",
        "backend_error": "Бэкенд не смог обработать заявку.",
        "network_error": "Не удалось подключиться к сервису бэкенда.",
        "invalid_user_id": "ID заявителя должен содержать от 2 до 50 символов.",
        "invalid_age": "Возраст должен быть целым числом от 18 до 120.",
        "invalid_income": "Ежемесячный доход должен быть числом, больше или равным 100.",
        "invalid_loan_amount": "Сумма кредита должна быть от 500 до 500000.",
        "invalid_loan_term": "Срок кредита должен быть целым числом от 3 до 360.",
        "invalid_credit_history": "Кредитная история должна быть от 0 до 50.",
        "invalid_current_debt": "Текущий долг должен быть от 0 до 10000000.",
        "invalid_employment_years": "Стаж работы должен быть от 0 до 60.",
        "invalid_dependents": "Иждивенцы должны быть целым числом от 0 до 20.",
        "result_header": "Результат скоринга",
        "result": "Результат",
        "probability": "Вероятность",
        "risk": "Риск",
        "recommended_amount": "Рекомендуемая сумма",
        "application_id": "ID заявки",
        "help": (
            "/start - начать новую заявку\n"
            "/cancel - отменить текущую заявку\n"
            "/help - показать эту справку"
        ),
    },
    "kyrg": {
        "select_language": "Тилинизди тандаңыз:",
        "start": (
            "Кредит Скоринг Бот\n\n"
            "Бир нече суроолор берем жана сизиндин арзаныңды рейтинг кызматына жөнөтөм.\n"
            "Учурдагы арзаныңды жокко чыгаруу үчүн /cancel колдонуңуз."
        ),
        "cancelled": "Учурдагы арзаны жокко чыгарылды.",
        "no_active_form": "Бул учурда активдүү арза формасы жок.",
        "ask_user_id": "Өтүнүчүнүн ID сын киргизиңиз.",
        "ask_age": "Жалпы жылдардагы жашын киргизиңиз. Мисалы: 29",
        "ask_income": "Айлык кирешеңизди киргизиңиз. Мисалы: 12000",
        "ask_loan_amount": "Өтүнгөн кредит сумасын киргизиңиз. Мисалы: 25000",
        "ask_loan_term": "Кредит мөөнөтүн айларда киргизиңиз. Мисалы: 24",
        "ask_credit_history": "Кредит тарихын жылдарда киргизиңиз. Мисалы: 6",
        "ask_current_debt": "Учурдагы карызды киргизиңиз. Мисалы: 1800",
        "ask_employment_years": "Иштелген жылдарды киргизиңиз. Мисалы: 4",
        "ask_dependents": "Иждивенттердин санын киргизиңиз. Мисалы: 1",
        "processing": "Сизиндин арзаңыз иштетилип жатат, сураныч кутуңуз...",
        "backend_error": "Бэкенд арзаны иштете алган жок.",
        "network_error": "Бэкенд кызматына туташ боло алган жок.",
        "invalid_user_id": "Өтүнүчүнүн ID сы 2ден 50 символга чейин болушу керек.",
        "invalid_age": "Жаш 18ден 120ге чейин болгон бүтүн сан болушу керек.",
        "invalid_income": "Айлык киреше 100гө барабар же андан чоң сан болушу керек.",
        "invalid_loan_amount": "Кредит сумасы 500ден 500000ге чейин болушу керек.",
        "invalid_loan_term": "Кредит мөөнөтү 3тән 360го чейин болгон бүтүн сан болушу керек.",
        "invalid_credit_history": "Кредит тарихы 0дөн 50ге чейин болушу керек.",
        "invalid_current_debt": "Учурдагы карыз 0дөн 10000000ге чейин болушу керек.",
        "invalid_employment_years": "Иштелген жылдар 0дөн 60го чейин болушу керек.",
        "invalid_dependents": "Иждивенттер 0дөн 20ге чейин болгон бүтүн сан болушу керек.",
        "result_header": "Скоринг натыйжасы",
        "result": "Натыйжа",
        "probability": "Ыктымалдык",
        "risk": "Тобокелдик",
        "recommended_amount": "Сунушталган сумма",
        "application_id": "Арза ID си",
        "help": (
            "/start - жаңы арзаны баштоо\n"
            "/cancel - учурдагы арзаны жокко чыгаруу\n"
            "/help - бул жардамды көрсөтүү"
        ),
    },
}


def get_text(lang: str, key: str) -> str:
    """Get text for a specific language and key."""
    return TEXTS.get(lang, TEXTS["eng"]).get(key, key)


def format_currency(value: float) -> str:
    return f"${value:,.2f}"


def parse_int(raw: str) -> int | None:
    try:
        return int(raw.strip())
    except (TypeError, ValueError):
        return None


def parse_float(raw: str) -> float | None:
    try:
        return float(raw.strip().replace(",", "."))
    except (TypeError, ValueError):
        return None


async def send_score_request(payload: dict[str, Any]) -> dict[str, Any]:
    timeout = aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(f"{BACKEND_URL}/api/score", json=payload) as response:
            text = await response.text()
            if not text:
                raise RuntimeError(TEXT["backend_error"])

            try:
                data = await response.json()
            except aiohttp.ContentTypeError as exc:
                raise RuntimeError(f"Unexpected backend response: {text[:200]}") from exc

            if response.status != 200:
                raise RuntimeError(data.get("message") or TEXT["backend_error"])

            return data


@dp.message(CommandStart())
async def start(message: Message, state: FSMContext) -> None:
    await state.clear()
    
    # Create language selection keyboard
    builder = InlineKeyboardBuilder()
    builder.button(text="Русский (RUS)", callback_data="lang_rus")
    builder.button(text="Кыргызча (KYR)", callback_data="lang_kyrg")
    builder.adjust(2)
    
    await message.answer(
        "Select your language / Выберите язык / Тилинизди тандаңыз:",
        reply_markup=builder.as_markup()
    )


@dp.callback_query(lambda c: c.data.startswith("lang_"))
async def process_language_selection(callback: CallbackQuery, state: FSMContext) -> None:
    lang = callback.data.split("_")[1]  # Extract 'rus' or 'kyrg'
    
    await state.clear()
    await state.set_state(ApplicationForm.user_id)
    await state.update_data(language=lang)
    
    text = get_text(lang, "start")
    ask_user_id = get_text(lang, "ask_user_id")
    
    await callback.message.edit_text(f"{text}\n\n{ask_user_id}")
    await callback.answer()


@dp.message(Command("help"))
async def help_command(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    await message.answer(get_text(lang, "help"))


@dp.message(Command("cancel"))
async def cancel_command(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    if await state.get_state():
        await state.clear()
        await message.answer(get_text(lang, "cancelled"))
    else:
        await message.answer(get_text(lang, "no_active_form"))


@dp.message(ApplicationForm.user_id)
async def process_user_id(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    user_id = (message.text or "").strip()
    if not (2 <= len(user_id) <= 50):
        await message.answer(get_text(lang, "invalid_user_id"))
        return

    await state.update_data(user_id=user_id)
    await state.set_state(ApplicationForm.age)
    await message.answer(get_text(lang, "ask_age"))


@dp.message(ApplicationForm.age)
async def process_age(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    age = parse_int(message.text or "")
    if age is None or not (18 <= age <= 120):
        await message.answer(get_text(lang, "invalid_age"))
        return

    await state.update_data(age=age)
    await state.set_state(ApplicationForm.monthly_income)
    await message.answer(get_text(lang, "ask_income"))


@dp.message(ApplicationForm.monthly_income)
async def process_income(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    income = parse_float(message.text or "")
    if income is None or income < 100:
        await message.answer(get_text(lang, "invalid_income"))
        return

    await state.update_data(monthly_income=income)
    await state.set_state(ApplicationForm.loan_amount)
    await message.answer(get_text(lang, "ask_loan_amount"))


@dp.message(ApplicationForm.loan_amount)
async def process_loan_amount(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    loan_amount = parse_float(message.text or "")
    if loan_amount is None or not (500 <= loan_amount <= 500000):
        await message.answer(get_text(lang, "invalid_loan_amount"))
        return

    await state.update_data(loan_amount=loan_amount)
    await state.set_state(ApplicationForm.loan_term_months)
    await message.answer(get_text(lang, "ask_loan_term"))


@dp.message(ApplicationForm.loan_term_months)
async def process_loan_term(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    loan_term = parse_int(message.text or "")
    if loan_term is None or not (3 <= loan_term <= 360):
        await message.answer(get_text(lang, "invalid_loan_term"))
        return

    await state.update_data(loan_term_months=loan_term)
    await state.set_state(ApplicationForm.credit_history_years)
    await message.answer(get_text(lang, "ask_credit_history"))


@dp.message(ApplicationForm.credit_history_years)
async def process_credit_history(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    credit_history = parse_float(message.text or "")
    if credit_history is None or not (0 <= credit_history <= 50):
        await message.answer(get_text(lang, "invalid_credit_history"))
        return

    await state.update_data(credit_history_years=credit_history)
    await state.set_state(ApplicationForm.current_debt)
    await message.answer(get_text(lang, "ask_current_debt"))


@dp.message(ApplicationForm.current_debt)
async def process_current_debt(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    current_debt = parse_float(message.text or "")
    if current_debt is None or not (0 <= current_debt <= 10000000):
        await message.answer(get_text(lang, "invalid_current_debt"))
        return

    await state.update_data(current_debt=current_debt)
    await state.set_state(ApplicationForm.employment_years)
    await message.answer(get_text(lang, "ask_employment_years"))


@dp.message(ApplicationForm.employment_years)
async def process_employment_years(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    employment_years = parse_float(message.text or "")
    if employment_years is None or not (0 <= employment_years <= 60):
        await message.answer(get_text(lang, "invalid_employment_years"))
        return

    await state.update_data(employment_years=employment_years)
    await state.set_state(ApplicationForm.dependents)
    await message.answer(get_text(lang, "ask_dependents"))


@dp.message(ApplicationForm.dependents)
async def process_dependents(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    
    dependents = parse_int(message.text or "")
    if dependents is None or not (0 <= dependents <= 20):
        await message.answer(get_text(lang, "invalid_dependents"))
        return

    await state.update_data(dependents=dependents)
    payload = await state.get_data()

    await message.answer(get_text(lang, "processing"))

    try:
        result = await send_score_request(payload)
        await message.answer(
            f"{get_text(lang, 'result_header')}\n\n"
            f"{get_text(lang, 'result')}: {result.get('result', 'unknown')}\n"
            f"{get_text(lang, 'probability')}: {result.get('probability', 0):.1%}\n"
            f"{get_text(lang, 'risk')}: {result.get('riskLevel', 'unknown')}\n"
            f"{get_text(lang, 'recommended_amount')}: {format_currency(result.get('recommendedAmount', 0))}\n"
            f"{get_text(lang, 'application_id')}: {result.get('applicationId', '-')}"
        )
    except aiohttp.ClientError as exc:
        logger.exception("Network error while contacting backend")
        await message.answer(f"{get_text(lang, 'network_error')}\n{exc}")
    except Exception as exc:
        logger.exception("Scoring error")
        await message.answer(str(exc) or get_text(lang, "backend_error"))
    finally:
        await state.clear()


@dp.message()
async def fallback(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "eng")
    await message.answer("Use /start to begin or /help to see commands.")


async def main() -> None:
    logger.info("Starting telegram bot")

    if not BOT_TOKEN or BOT_TOKEN == "replace-me":
        raise RuntimeError("BOT_TOKEN is not set")

    bot_info = await bot.get_me()
    logger.info("Bot connected as @%s", bot_info.username)

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
