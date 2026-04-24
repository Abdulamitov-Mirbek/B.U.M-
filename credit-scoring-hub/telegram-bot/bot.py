import asyncio
import logging
import os
import sys

import aiohttp
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "replace-me")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Translations dictionary
TRANSLATIONS = {
    "ru": {
        "lang_select": "Выберите язык / Тилди тандаңыз",
        "welcome": "Добро пожаловать в Credit Scoring Hub!\nПожалуйста, введите ваш ID пользователя.",
        "user_id": "Введите ваш ID пользователя:",
        "user_id_empty": "ID пользователя не может быть пустым.",
        "age": "Сколько вам лет?",
        "age_invalid": "Пожалуйста, введите корректный возраст (целое число).",
        "monthly_income": "Какой у вас ежемесячный доход?",
        "income_invalid": "Пожалуйста, введите корректную сумму дохода.",
        "loan_amount": "Какую сумму кредита запрашиваете?",
        "loan_amount_invalid": "Пожалуйста, введите корректную сумму кредита.",
        "loan_term": "На какой срок (в месяцах)?",
        "loan_term_invalid": "Пожалуйста, введите корректное количество месяцев.",
        "credit_history": "Сколько лет кредитной истории у вас есть?",
        "credit_history_invalid": "Пожалуйста, введите корректное количество лет.",
        "current_debt": "Какова ваша текущая задолженность?",
        "debt_invalid": "Пожалуйста, введите корректную сумму задолженности.",
        "employment_years": "Сколько лет вы работаете?",
        "employment_invalid": "Пожалуйста, введите корректное количество лет.",
        "dependents": "Сколько у вас иждивенцев?",
        "dependents_invalid": "Пожалуйста, введите корректное количество иждивенцев.",
        "approved": "✅ ОДОБРЕНО",
        "rejected": "❌ ОТКАЗАНО",
        "result": "Результат",
        "probability": "Вероятность",
        "risk_level": "Уровень риска",
        "recommended_amount": "Рекомендуемая сумма",
        "application_id": "ID заявки",
        "error_backend": "Извините, не удалось обработать заявку. Попробуйте позже.",
        "error_network": "Не удалось подключиться к сервису. Попробуйте позже.",
        "error_unexpected": "Произошла непредвиденная ошибка. Попробуйте снова.",
        "scoring": "Оцениваем заявку...",
        "low": "Низкий",
        "medium": "Средний",
        "high": "Высокий"
    },
    "ky": {
        "lang_select": "Выберите язык / Тилди тандаңыз",
        "welcome": "Credit Scoring Hub'га кош келиңиз!\nСураныч, колдонуучу ID'ңизди киргизиңиз.",
        "user_id": "Колдонуучу ID'ңизди киргизиңиз:",
        "user_id_empty": "Колдонуучу ID бош болбошу керек.",
        "age": "Жашыңыз канчада?",
        "age_invalid": "Сураныч, туура жашты киргизиңиз (бүтүн сан).",
        "monthly_income": "Айлык кирешеңиз канча?",
        "income_invalid": "Сураныч, туура кирешени киргизиңиз.",
        "loan_amount": "Канча насыя сурап жатасыз?",
        "loan_amount_invalid": "Сураныч, туура насыя суммасын киргизиңиз.",
        "loan_term": "Канча айга?",
        "loan_term_invalid": "Сураныч, туура айлардын санын киргизиңиз.",
        "credit_history": "Канча жылдык насыя тарыхыңыз бар?",
        "credit_history_invalid": "Сураныч, туура жылдарды киргизиңиз.",
        "current_debt": "Учурдагы карызыңыз канча?",
        "debt_invalid": "Сураныч, туура карыз суммасын киргизиңиз.",
        "employment_years": "Канча жылдан бери иштейсиз?",
        "employment_invalid": "Сураныч, туура жылдарды киргизиңиз.",
        "dependents": "Канча багуусуңузда киши бар?",
        "dependents_invalid": "Сураныч, туура санды киргизиңиз.",
        "approved": "✅ ЖАКТЫРЫЛДЫ",
        "rejected": "❌ ЧЕТКЕ КАГЫЛДЫ",
        "result": "Жыйынтык",
        "probability": "Ыктымалдуулук",
        "risk_level": "Тобокелдик деңгээли",
        "recommended_amount": "Сунушталган сумма",
        "application_id": "Арыз ID",
        "error_backend": "Кечиресиз, арызды иштетүү мүмкүн болбоду. Кийинчерээк кайталаңыз.",
        "error_network": "Сервиске туташуу мүмкүн болбоду. Кийинчерээк кайталаңыз.",
        "error_unexpected": "Күтүлбөгөн ката кетти. Кайра аракет кылыңыз.",
        "scoring": "Арыз бааланууда...",
        "low": "Төмөн",
        "medium": "Орто",
        "high": "Жогорку"
    }
}

# Risk level translations
RISK_TRANSLATIONS = {
    "low": {"ru": "Низкий", "ky": "Төмөн"},
    "medium": {"ru": "Средний", "ky": "Орто"},
    "high": {"ru": "Высокий", "ky": "Жогорку"}
}

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


def get_lang_keyboard():
    """Create language selection keyboard"""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🇷🇺 Русский"), KeyboardButton(text="🇰🇬 Кыргызча")]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )


@dp.message(CommandStart())
async def start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(ApplicationForm.language)
    await message.answer(
        "Выберите язык / Тилди тандаңыз:",
        reply_markup=get_lang_keyboard()
    )
    logger.info(f"User {message.from_user.id} started - language selection")


@dp.message(ApplicationForm.language)
async def process_language(message: Message, state: FSMContext) -> None:
    text = message.text or ""
    
    if "Русский" in text or "русский" in text.lower():
        lang = "ru"
    elif "Кыргыз" in text or "кыргыз" in text.lower():
        lang = "ky"
    else:
        await message.answer(
            "Пожалуйста, выберите язык кнопкой ниже.\n"
            "Сураныч, төмөндөгү баскыч менен тилди тандаңыз.",
            reply_markup=get_lang_keyboard()
        )
        return
    
    await state.update_data(language=lang)
    await state.set_state(ApplicationForm.user_id)
    
    t = TRANSLATIONS[lang]
    await message.answer(t["welcome"], reply_markup=ReplyKeyboardMarkup(keyboard=[], resize_keyboard=True))
    logger.info(f"User {message.from_user.id} selected language: {lang}")


@dp.message(ApplicationForm.user_id)
async def process_user_id(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    user_id = (message.text or "").strip()
    if not user_id:
        await message.answer(t["user_id_empty"])
        return

    await state.update_data(user_id=user_id)
    await state.set_state(ApplicationForm.age)
    await message.answer(t["age"])
    logger.info(f"User ID: {user_id}")


@dp.message(ApplicationForm.age)
async def process_age(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        age = int(message.text or "0")
        await state.update_data(age=age)
        await state.set_state(ApplicationForm.monthly_income)
        await message.answer(t["monthly_income"])
    except ValueError:
        await message.answer(t["age_invalid"])


@dp.message(ApplicationForm.monthly_income)
async def process_income(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        income = float(message.text or "0")
        await state.update_data(monthly_income=income)
        await state.set_state(ApplicationForm.loan_amount)
        await message.answer(t["loan_amount"])
    except ValueError:
        await message.answer(t["income_invalid"])


@dp.message(ApplicationForm.loan_amount)
async def process_loan_amount(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        amount = float(message.text or "0")
        await state.update_data(loan_amount=amount)
        await state.set_state(ApplicationForm.loan_term_months)
        await message.answer(t["loan_term"])
    except ValueError:
        await message.answer(t["loan_amount_invalid"])


@dp.message(ApplicationForm.loan_term_months)
async def process_loan_term(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        term = int(message.text or "0")
        await state.update_data(loan_term_months=term)
        await state.set_state(ApplicationForm.credit_history_years)
        await message.answer(t["credit_history"])
    except ValueError:
        await message.answer(t["loan_term_invalid"])


@dp.message(ApplicationForm.credit_history_years)
async def process_credit_history(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        history = float(message.text or "0")
        await state.update_data(credit_history_years=history)
        await state.set_state(ApplicationForm.current_debt)
        await message.answer(t["current_debt"])
    except ValueError:
        await message.answer(t["credit_history_invalid"])


@dp.message(ApplicationForm.current_debt)
async def process_current_debt(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        debt = float(message.text or "0")
        await state.update_data(current_debt=debt)
        await state.set_state(ApplicationForm.employment_years)
        await message.answer(t["employment_years"])
    except ValueError:
        await message.answer(t["debt_invalid"])


@dp.message(ApplicationForm.employment_years)
async def process_employment_years(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        employment = float(message.text or "0")
        await state.update_data(employment_years=employment)
        await state.set_state(ApplicationForm.dependents)
        await message.answer(t["dependents"])
    except ValueError:
        await message.answer(t["employment_invalid"])


@dp.message(ApplicationForm.dependents)
async def process_dependents(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    lang = data.get("language", "ru")
    t = TRANSLATIONS[lang]
    
    try:
        dependents = int(message.text or "0")
        await state.update_data(dependents=dependents)
        payload = await state.get_data()
        
        # Remove language from payload before sending to backend
        payload.pop("language", None)
        
        await message.answer(t["scoring"])
        logger.info(f"Sending scoring request for user: {payload.get('user_id')}")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/api/score", json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Backend error: {error_text}")
                    await message.answer(t["error_backend"])
                    await state.clear()
                    return
                    
                result = await response.json()

        # Format result
        risk_key = result["riskLevel"]
        risk_translated = RISK_TRANSLATIONS.get(risk_key, {}).get(lang, risk_key)
        
        status = t["approved"] if result["result"] == "approved" else t["rejected"]
        
        result_message = (
            f"*{status}*\n\n"
            f"📊 {t['result']}: {result['result'].title()}\n"
            f"📈 {t['probability']}: {result['probability']:.2%}\n"
            f"⚠️ {t['risk_level']}: {risk_translated}\n"
            f"💰 {t['recommended_amount']}: ${result['recommendedAmount']:,.2f}\n"
            f"🆔 {t['application_id']}: `{result['applicationId']}`"
        )
        
        await message.answer(result_message, parse_mode="Markdown")
        logger.info(f"Result sent: {result['result']}, Score: {result['score']}")
        await state.clear()
        
    except ValueError:
        await message.answer(t["dependents_invalid"])
    except aiohttp.ClientError as e:
        logger.error(f"Backend connection error: {e}")
        await message.answer(t["error_network"])
        await state.clear()
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        await message.answer(t["error_unexpected"])
        await state.clear()


@dp.message(CommandStart())
async def restart(message: Message, state: FSMContext) -> None:
    """Handle /start command - restart the application"""
    await start(message, state)


async def main() -> None:
    logger.info("=" * 50)
    logger.info("Starting Credit Scoring Telegram Bot...")
    
    if BOT_TOKEN == "replace-me":
        logger.error("BOT_TOKEN not set! Please set it in .env file")
        raise RuntimeError("Set BOT_TOKEN before starting the bot")
    
    logger.info(f"Backend URL: {BACKEND_URL}")
    
    # Get bot info
    try:
        bot_info = await bot.get_me()
        logger.info(f"Bot connected: @{bot_info.username}")
        logger.info(f"Bot name: {bot_info.first_name}")
    except Exception as e:
        logger.error(f"Failed to connect to Telegram: {e}")
        raise
    
    # Delete webhook and start polling
    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Started polling for messages...")
    logger.info("Supported languages: Russian (ru), Kyrgyz (ky)")
    logger.info("=" * 50)
    
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot crashed: {e}")