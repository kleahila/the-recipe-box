# Stage 1: Build the application
# UPDATED: Using .NET 9 SDK
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the project file first to cache dependencies
COPY ["RecipeBox.API.csproj", "./"]
RUN dotnet restore "RecipeBox.API.csproj"

# Copy the rest of the code and build the release version
COPY . .
RUN dotnet publish "RecipeBox.API.csproj" -c Release -o /app/publish

# Stage 2: Run the application
# UPDATED: Using .NET 9 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port the app runs on
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "RecipeBox.API.dll"]
