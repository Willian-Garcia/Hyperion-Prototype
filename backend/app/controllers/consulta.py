from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.core.database import SessionLocal
from app.schemas.tb_consulta import Consulta

async def persistir_consulta(data: dict):
    async with SessionLocal() as session:
        # Verifica se o ID já existe
        result = await session.execute(
            select(Consulta).where(Consulta.id == data['id'])
        )
        existente = result.scalar_one_or_none()
        if existente:
            return existente  # Já está no banco, não precisa persistir

        # Se não existe, persiste
        consulta = Consulta(
            id=data['id'],
            id_consulta=data['id'],
            banda13=data['bandas']['BAND13'],
            banda14=data['bandas']['BAND14'],
            banda15=data['bandas']['BAND15'],
            banda16=data['bandas']['BAND16'],
            cmask=data['cmask'],
            thumbnail=data['thumbnail'],
            data=data['data'],
            cobertura_nuvem=data['cobertura_nuvem'],
            bbox=data['bbox'],
            bandas=data['bandas']
        )

        session.add(consulta)
        await session.commit()
        return consulta
